import { NextRequest, NextResponse } from 'next/server';
import { parseCallFilename } from '@/lib/metadata-parser';
import { addCall, generateCallId, ensureDirectories } from '@/lib/storage';
import type { Call, ApiResponse } from '@/types';
import busboy from 'busboy';
import fs from 'fs';
import path from 'path';

// Route segment config to increase body size limit
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

const MAX_FILE_SIZE = 9 * 1024 * 1024; // 9MB upload limit (Next.js constraint)
const ALLOWED_MIME_TYPES = ['audio/wav', 'audio/x-wav', 'audio/wave', 'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a'];
const UPLOADS_DIR = path.join(process.cwd(), 'data', 'uploads');

interface FileInfo {
  filename: string;
  filepath: string;
  size: number;
  mimetype: string;
}

/**
 * POST /api/upload
 * Upload WAV file(s) for processing using streaming
 */
export async function POST(req: NextRequest) {
  try {
    console.log('[UPLOAD] Request received at', new Date().toISOString());

    // Ensure uploads directory exists
    await ensureDirectories();

    const uploadedFiles: FileInfo[] = [];
    const uploadedCalls: Call[] = [];
    const errors: string[] = [];

    // Get content type for busboy
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid content type. Expected multipart/form-data',
        },
        { status: 400 }
      );
    }

    // Parse multipart form data with streaming
    await new Promise<void>(async (resolve, reject) => {
      const bb = busboy({
        headers: {
          'content-type': contentType,
        },
        limits: {
          fileSize: MAX_FILE_SIZE,
          files: 10, // Max 10 files per upload
        },
      });

      bb.on('file', (fieldname, file, info) => {
        const { filename, mimeType } = info;
        console.log(`[UPLOAD] Processing file: ${filename}, type: ${mimeType}`);

        // Validate file type
        if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
          errors.push(`${filename}: Invalid file type. Only audio files are accepted.`);
          file.resume(); // Drain the stream
          return;
        }

        // Parse filename to extract metadata
        const parseResult = parseCallFilename(filename);
        if (!parseResult.success) {
          errors.push(`${filename}: ${parseResult.error}`);
          file.resume(); // Drain the stream
          return;
        }

        // Create write stream to disk
        const filepath = path.join(UPLOADS_DIR, filename);
        const writeStream = fs.createWriteStream(filepath);
        let fileSize = 0;

        file.on('data', (chunk) => {
          fileSize += chunk.length;
        });

        file.on('limit', () => {
          errors.push(`${filename}: File size exceeds 100MB upload limit.`);
          writeStream.destroy();
          fs.unlink(filepath, () => {}); // Delete partial file
        });

        file.on('error', (err) => {
          console.error(`[UPLOAD] File stream error for ${filename}:`, err);
          errors.push(`${filename}: ${err.message}`);
          writeStream.destroy();
        });

        writeStream.on('error', (err) => {
          console.error(`[UPLOAD] Write stream error for ${filename}:`, err);
          errors.push(`${filename}: ${err.message}`);
        });

        writeStream.on('finish', () => {
          console.log(`[UPLOAD] File saved: ${filename}, size: ${(fileSize / 1024 / 1024).toFixed(2)}MB`);
          uploadedFiles.push({
            filename,
            filepath,
            size: fileSize,
            mimetype: mimeType,
          });
        });

        // Pipe file stream to disk
        file.pipe(writeStream);
      });

      bb.on('error', (err) => {
        console.error('[UPLOAD] Busboy error:', err);
        reject(err);
      });

      bb.on('finish', () => {
        console.log('[UPLOAD] Busboy finished parsing');
        resolve();
      });

      // Read request body and feed to busboy
      try {
        if (!req.body) {
          reject(new Error('Request body is null'));
          return;
        }

        const reader = req.body.getReader();

        async function pump() {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                bb.end();
                break;
              }
              bb.write(value);
            }
          } catch (err) {
            reject(err);
          }
        }

        pump();
      } catch (err) {
        reject(err);
      }
    });

    // Process uploaded files and create call records
    for (const fileInfo of uploadedFiles) {
      try {
        const parseResult = parseCallFilename(fileInfo.filename);
        if (!parseResult.success) {
          continue; // Already added to errors
        }

        const metadata = parseResult.metadata!;

        // Create call record
        const call: Call = {
          id: generateCallId(),
          filename: fileInfo.filename,
          agentName: metadata.agentName,
          agentId: metadata.agentId,
          phoneNumber: metadata.phoneNumber,
          callId: metadata.callId,
          timestamp: metadata.timestamp,
          duration: 0, // Will be set after transcription
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Store call metadata
        const savedCall = await addCall(call);
        uploadedCalls.push(savedCall);

        // Trigger transcription asynchronously (don't wait)
        // Use AssemblyAI by default for better speaker diarization
        // Determine the base URL based on environment
        const isProduction = process.env.NODE_ENV === 'production';
        const baseUrl = isProduction
          ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN || 'pikl-qa-assist-production.up.railway.app'}`
          : `http://localhost:${process.env.PORT || 3000}`;

        fetch(`${baseUrl}/api/transcribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callId: savedCall.id,
            provider: 'assemblyai', // Use AssemblyAI for superior diarization
          }),
        }).catch((err) => console.error('Failed to trigger transcription:', err));

        console.log(`[UPLOAD] Call record created: ${savedCall.id}`);
      } catch (fileError) {
        errors.push(`${fileInfo.filename}: ${(fileError as Error).message}`);
      }
    }

    // Return response
    if (uploadedCalls.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'No files were successfully uploaded',
          message: errors.join('; '),
        },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse<{ calls: Call[]; errors: string[] }>>(
      {
        success: true,
        data: {
          calls: uploadedCalls,
          errors,
        },
        message: `Successfully uploaded ${uploadedCalls.length} file(s)${
          errors.length > 0 ? ` with ${errors.length} error(s)` : ''
        }`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[UPLOAD] Upload error:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Internal server error',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
