import { NextRequest, NextResponse } from 'next/server';
import { parseCallFilename } from '@/lib/metadata-parser';
import { addCall, generateCallId, ensureDirectories } from '@/lib/storage';
import type { Call, ApiResponse } from '@/types';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const maxDuration = 300;

const UPLOADS_DIR = path.join(process.cwd(), 'data', 'uploads');
const TEMP_DIR = path.join(process.cwd(), 'data', 'temp');

/**
 * POST /api/upload/chunk
 * Handle chunked file uploads using raw binary data (bypasses FormData 10MB limit)
 */
export async function POST(req: NextRequest) {
  try {
    console.log('[CHUNK] Chunk upload request received');

    // Ensure directories exist
    await ensureDirectories();
    await fs.mkdir(TEMP_DIR, { recursive: true });

    // Read metadata from headers (bypasses FormData parsing)
    const filename = req.headers.get('x-filename');
    const chunkIndex = parseInt(req.headers.get('x-chunk-index') || '');
    const totalChunks = parseInt(req.headers.get('x-total-chunks') || '');

    if (!filename || isNaN(chunkIndex) || isNaN(totalChunks)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Missing required headers: x-filename, x-chunk-index, x-total-chunks' },
        { status: 400 }
      );
    }

    console.log(`[CHUNK] Received chunk ${chunkIndex + 1}/${totalChunks} for ${filename}`);

    // Read raw binary body (no FormData parsing - works with any size up to Railway/Vercel limits)
    const arrayBuffer = await req.arrayBuffer();
    const chunkBuffer = Buffer.from(arrayBuffer);

    console.log(`[CHUNK] Chunk size: ${(chunkBuffer.length / 1024 / 1024).toFixed(2)}MB`);

    // Save chunk to temp directory
    const chunkPath = path.join(TEMP_DIR, `${filename}.part${chunkIndex}`);
    await fs.writeFile(chunkPath, chunkBuffer);

    // If this is the last chunk, assemble the file
    if (chunkIndex === totalChunks - 1) {
      console.log(`[CHUNK] Assembling ${totalChunks} chunks for ${filename}`);

      const finalPath = path.join(UPLOADS_DIR, filename);
      const writeStream = await fs.open(finalPath, 'w');

      // Combine all chunks
      for (let i = 0; i < totalChunks; i++) {
        const partPath = path.join(TEMP_DIR, `${filename}.part${i}`);
        const partBuffer = await fs.readFile(partPath);
        await writeStream.write(partBuffer);
        // Delete chunk after reading
        await fs.unlink(partPath);
      }

      await writeStream.close();
      console.log(`[CHUNK] File assembled: ${filename}`);

      // Parse filename and create call record
      const parseResult = parseCallFilename(filename);
      if (!parseResult.success) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: parseResult.error },
          { status: 400 }
        );
      }

      const metadata = parseResult.metadata!;

      const call: Call = {
        id: generateCallId(),
        filename,
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

      const savedCall = await addCall(call);
      console.log(`[CHUNK] Call record created: ${savedCall.id}`);

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
      }).catch((err) => console.error('[CHUNK] Failed to trigger transcription:', err));

      return NextResponse.json<ApiResponse<{ call: Call }>>({
        success: true,
        data: { call: savedCall },
        message: 'File uploaded successfully',
      });
    }

    // Return success for intermediate chunks
    return NextResponse.json<ApiResponse<{ chunkIndex: number }>>({
      success: true,
      data: { chunkIndex },
      message: `Chunk ${chunkIndex + 1}/${totalChunks} received`,
    });
  } catch (error) {
    console.error('[CHUNK] Upload error:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Upload failed',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
