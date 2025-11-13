import { NextRequest, NextResponse } from 'next/server';
import { analyzeTranscript, estimateAnalysisCost } from '@/lib/claude-service';
import { saveAnalysis, updateCall, getTranscript, getCallById } from '@/lib/storage';
import { createQALogEntry, upsertQALogEntry } from '@/lib/qa-log-service';
import type { Transcript, AnalysisResponse, ApiResponse } from '@/types';

/**
 * POST /api/analyze
 * Analyze a transcript using Claude AI
 *
 * Request body:
 * {
 *   "callId": string (to load transcript from storage)
 *   OR
 *   "transcript": Transcript object (from /api/transcribe)
 * }
 *
 * Response:
 * {
 *   "analysis": Analysis object with scores and recommendations
 *   "estimatedCost": number (USD)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Validate API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    let transcript: Transcript;

    // Support both callId and direct transcript
    if (body.callId) {
      const storedTranscript = await getTranscript(body.callId);
      if (!storedTranscript) {
        return NextResponse.json(
          { error: 'Transcript not found for this call' },
          { status: 404 }
        );
      }
      transcript = storedTranscript;
    } else if (body.transcript) {
      transcript = body.transcript;
    } else {
      return NextResponse.json(
        { error: 'Either callId or transcript is required' },
        { status: 400 }
      );
    }

    // Validate transcript
    if (!transcript || !transcript.callId || !Array.isArray(transcript.turns)) {
      return NextResponse.json(
        { error: 'Invalid transcript format' },
        { status: 400 }
      );
    }

    if (transcript.turns.length === 0) {
      return NextResponse.json(
        { error: 'Transcript is empty' },
        { status: 400 }
      );
    }

    // Estimate cost before analysis
    const estimatedCost = estimateAnalysisCost(transcript);

    console.log(`Analyzing transcript ${transcript.callId} (estimated cost: $${estimatedCost.toFixed(4)})`);

    // Perform analysis
    const analysis = await analyzeTranscript(transcript);

    // Save analysis to storage
    await saveAnalysis(analysis);

    // Update call status to complete
    await updateCall(transcript.callId, {
      status: 'complete',
      overallScore: analysis.overallScore,
      analysisUrl: `/data/analyses/${transcript.callId}.json`,
    });

    // Create QA Log entry
    try {
      const call = await getCallById(transcript.callId);
      if (call) {
        const qaLogEntry = await createQALogEntry(call, analysis);
        await upsertQALogEntry(qaLogEntry);
      }
    } catch (qaError) {
      console.error('Failed to create QA Log entry:', qaError);
      // Don't fail the whole analysis if QA Log creation fails
    }

    // Return analysis results
    const response: AnalysisResponse & { estimatedCost: number } = {
      analysis,
      estimatedCost,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Analysis API error:', error);

    // Try to update call status to error
    try {
      const body = await request.json();
      const callId = body.callId || body.transcript?.callId;
      if (callId) {
        await updateCall(callId, {
          status: 'error',
          errorMessage: (error as Error).message,
        });
      }
    } catch {}

    return NextResponse.json(
      {
        error: 'Failed to analyze transcript',
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analyze
 * Get API status
 */
export async function GET() {
  const isConfigured = !!process.env.ANTHROPIC_API_KEY;

  return NextResponse.json({
    status: 'ok',
    service: 'Claude QA Analysis API',
    model: 'claude-sonnet-4.5-20250929',
    configured: isConfigured,
  });
}
