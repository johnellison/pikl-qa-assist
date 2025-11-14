import { NextRequest, NextResponse } from 'next/server';
import { Server, Upload } from '@tus/server';
import { FileStore } from '@tus/file-store';
import path from 'path';
import { parseCallFilename } from '@/lib/metadata-parser';
import { addCall, generateCallId, ensureDirectories } from '@/lib/storage';
import type { Call } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 300;

const UPLOADS_DIR = path.join(process.cwd(), 'data', 'uploads');

// Create tus server instance
const tusServer = new Server({
  path: '/api/upload/tus',
  datastore: new FileStore({ directory: UPLOADS_DIR }),
  // Allow files up to 100MB
  maxSize: 100 * 1024 * 1024,
  // Handle upload completion
  async onUploadFinish(req, res, upload: Upload) {
    console.log('[TUS] Upload complete:', upload.id);

    try {
      // Get the original filename from metadata
      const filename = upload.metadata?.filename || upload.id;
      console.log('[TUS] Processing completed upload:', filename);

      // Parse filename to extract call metadata
      const parseResult = parseCallFilename(filename as string);
      if (!parseResult.success) {
        console.error('[TUS] Failed to parse filename:', parseResult.error);
        return;
      }

      const metadata = parseResult.metadata!;

      // Create call record
      const call: Call = {
        id: generateCallId(),
        filename: filename as string,
        agentName: metadata.agentName,
        agentId: metadata.agentId,
        phoneNumber: metadata.phoneNumber,
        callId: metadata.callId,
        timestamp: metadata.timestamp,
        duration: 0,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store call metadata
      const savedCall = await addCall(call);
      console.log('[TUS] Call record created:', savedCall.id);

      // Trigger transcription
      const isProduction = process.env.NODE_ENV === 'production';
      const baseUrl = isProduction
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN || 'pikl-qa-assist-production.up.railway.app'}`
        : `http://localhost:${process.env.PORT || 3000}`;

      fetch(`${baseUrl}/api/transcribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callId: savedCall.id,
          provider: 'assemblyai',
        }),
      }).catch((err) => console.error('[TUS] Failed to trigger transcription:', err));
    } catch (error) {
      console.error('[TUS] Error in onUploadFinish:', error);
    }
  },
});

// Initialize upload directory
ensureDirectories().catch(console.error);

// Handle all HTTP methods for tus protocol
async function handleTusRequest(req: NextRequest) {
  try {
    // Convert Next.js request to Node.js-like request format
    const nodeReq: any = {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries()),
    };

    // For requests with body, convert Web Stream to Node stream
    if (req.body && ['POST', 'PATCH'].includes(req.method!)) {
      const chunks: Uint8Array[] = [];
      const reader = req.body.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      const bodyBuffer = Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));
      nodeReq.body = bodyBuffer;
    }

    // Create a response-like object
    const nodeRes: any = {
      statusCode: 200,
      headers: {} as Record<string, string>,
      setHeader(name: string, value: string) {
        this.headers[name] = value;
      },
      getHeader(name: string) {
        return this.headers[name];
      },
      removeHeader(name: string) {
        delete this.headers[name];
      },
      write(chunk: any) {
        if (!this.body) this.body = [];
        this.body.push(chunk);
      },
      end(chunk?: any) {
        if (chunk) this.write(chunk);
        this.finished = true;
      },
      body: [] as any[],
      finished: false,
    };

    // Handle the request with tus server
    await tusServer.handle(nodeReq, nodeRes);

    // Wait for response to finish
    await new Promise<void>((resolve) => {
      const checkFinished = () => {
        if (nodeRes.finished) {
          resolve();
        } else {
          setTimeout(checkFinished, 10);
        }
      };
      checkFinished();
    });

    // Convert back to Next.js response
    const responseBody = nodeRes.body.length > 0
      ? Buffer.concat(nodeRes.body.map((b: any) => Buffer.isBuffer(b) ? b : Buffer.from(b)))
      : undefined;

    return new NextResponse(responseBody, {
      status: nodeRes.statusCode,
      headers: nodeRes.headers,
    });
  } catch (error) {
    console.error('[TUS] Error handling request:', error);
    return NextResponse.json(
      { error: 'Upload failed', message: (error as Error).message },
      { status: 500 }
    );
  }
}

export const GET = handleTusRequest;
export const POST = handleTusRequest;
export const PATCH = handleTusRequest;
export const DELETE = handleTusRequest;
export const HEAD = handleTusRequest;
export const OPTIONS = handleTusRequest;
