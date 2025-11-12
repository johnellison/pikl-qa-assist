import { NextRequest, NextResponse } from 'next/server';
import { parseCallFilename } from '@/lib/metadata-parser';
import { addCall, saveUploadedFile, generateCallId } from '@/lib/storage';
import { compressAudioIfNeeded, formatBytes } from '@/lib/audio-compression';
import type { Call, ApiResponse } from '@/types';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB upload limit (will compress to 25MB if needed)
const WHISPER_LIMIT = 25 * 1024 * 1024; // 25MB OpenAI Whisper API limit
const ALLOWED_MIME_TYPES = ['audio/wav', 'audio/x-wav', 'audio/wave'];

/**
 * POST /api/upload
 * Upload WAV file(s) for processing
 */
export async function POST(req: NextRequest) {
  try {
    // Get the form data directly
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'No files provided',
        },
        { status: 400 }
      );
    }

    const uploadedCalls: Call[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        // Validate file type
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          errors.push(`${file.name}: Invalid file type. Only WAV files are accepted.`);
          continue;
        }

        // Validate file size (allow up to 50MB, will compress if needed)
        if (file.size > MAX_FILE_SIZE) {
          errors.push(`${file.name}: File size exceeds 50MB upload limit.`);
          continue;
        }

        // Parse filename to extract metadata
        const parseResult = parseCallFilename(file.name);
        if (!parseResult.success) {
          errors.push(`${file.name}: ${parseResult.error}`);
          continue;
        }

        const metadata = parseResult.metadata!;

        // Read file buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Save file to uploads directory
        let savedPath = await saveUploadedFile(buffer, file.name);

        // Compress audio if it exceeds Whisper API limit
        const compressionResult = await compressAudioIfNeeded(savedPath, file.name);
        let physicalFilename = file.name; // The actual file on disk

        if (compressionResult.compressed) {
          savedPath = compressionResult.path;
          physicalFilename = savedPath.split('/').pop() || file.name;
          console.log(
            `Compressed ${file.name}: ${formatBytes(compressionResult.originalSize)} → ${formatBytes(compressionResult.finalSize)}`
          );
        }

        // Create call record
        const call: Call = {
          id: generateCallId(),
          filename: physicalFilename, // Store the actual physical filename
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
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/transcribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callId: savedCall.id }),
        }).catch((err) => console.error('Failed to trigger transcription:', err));
      } catch (fileError) {
        errors.push(`${file.name}: ${(fileError as Error).message}`);
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
    console.error('Upload error:', error);
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
