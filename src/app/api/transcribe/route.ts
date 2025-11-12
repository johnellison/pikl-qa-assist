import { NextRequest, NextResponse } from 'next/server';
import { getCallById, updateCall, getUploadPath, saveTranscript, saveTranscriptAsText } from '@/lib/storage';
import { transcribeAudio, formatTranscriptAsText, estimateTranscriptionCost } from '@/lib/whisper-service';
import type { ApiResponse, Transcript } from '@/types';

/**
 * POST /api/transcribe
 * Transcribe a specific call by ID
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { callId } = body;

    if (!callId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Call ID is required',
        },
        { status: 400 }
      );
    }

    // Get call record
    const call = await getCallById(callId);
    if (!call) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Call not found',
        },
        { status: 404 }
      );
    }

    // Check if already transcribed
    if (call.status === 'analyzing' || call.status === 'complete') {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Call already transcribed',
        },
        { status: 400 }
      );
    }

    // Update status to transcribing
    await updateCall(callId, { status: 'transcribing' });

    // Get audio file path
    const audioPath = getUploadPath(call.filename);

    // Log file information before sending to Whisper
    const fs = await import('fs/promises');
    try {
      const fileStats = await fs.stat(audioPath);
      const fileSizeMB = (fileStats.size / 1024 / 1024).toFixed(2);
      console.log(`[TRANSCRIBE] Preparing to send file to Whisper API:`);
      console.log(`[TRANSCRIBE]   Call ID: ${callId}`);
      console.log(`[TRANSCRIBE]   Filename: ${call.filename}`);
      console.log(`[TRANSCRIBE]   Path: ${audioPath}`);
      console.log(`[TRANSCRIBE]   Size: ${fileSizeMB}MB (${fileStats.size} bytes)`);
      console.log(`[TRANSCRIBE]   Whisper limit: 25MB (${25 * 1024 * 1024} bytes)`);

      if (fileStats.size > 25 * 1024 * 1024) {
        console.warn(`[TRANSCRIBE] ⚠ WARNING: File exceeds 25MB Whisper API limit!`);
      } else {
        console.log(`[TRANSCRIBE] ✓ File is under Whisper API limit`);
      }
    } catch (statError) {
      console.error(`[TRANSCRIBE] Failed to stat file:`, statError);
    }

    try {
      // Transcribe audio
      const transcript = await transcribeAudio(audioPath, callId);

      // Save transcript as JSON
      await saveTranscript(transcript);

      // Save transcript as plain text
      const textContent = formatTranscriptAsText(transcript);
      await saveTranscriptAsText(callId, textContent);

      // Estimate cost
      const cost = estimateTranscriptionCost(transcript.durationSeconds);

      // Update call record
      await updateCall(callId, {
        status: 'analyzing', // Ready for analysis
        duration: transcript.durationSeconds,
        transcriptUrl: `/data/transcripts/${callId}.json`,
      });

      // Trigger analysis asynchronously (don't wait)
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId }),
      }).catch((err) => console.error('Failed to trigger analysis:', err));

      return NextResponse.json<ApiResponse<{ transcript: Transcript; cost: number }>>(
        {
          success: true,
          data: {
            transcript,
            cost,
          },
          message: `Successfully transcribed call in ${Math.floor(transcript.processingTime! / 1000)}s. Cost: $${cost.toFixed(4)}`,
        },
        { status: 200 }
      );
    } catch (transcribeError) {
      // Update call status to error
      await updateCall(callId, {
        status: 'error',
        errorMessage: (transcribeError as Error).message,
      });

      throw transcribeError;
    }
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to transcribe audio',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
