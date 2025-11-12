import OpenAI from 'openai';
import fs from 'fs/promises';
import type { Transcript, TranscriptTurn } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface WhisperResponse {
  text: string;
  segments?: Array<{
    id: number;
    seek: number;
    start: number;
    end: number;
    text: string;
    tokens: number[];
    temperature: number;
    avg_logprob: number;
    compression_ratio: number;
    no_speech_prob: number;
  }>;
  language?: string;
  duration?: number;
}

/**
 * Transcribe audio file using OpenAI Whisper API
 * @param filePath - Path to the audio file
 * @returns Transcript object with speaker diarization
 */
export async function transcribeAudio(filePath: string, callId: string): Promise<Transcript> {
  const startTime = Date.now();

  try {
    // Read the audio file
    const fileBuffer = await fs.readFile(filePath);
    const file = new File([fileBuffer], filePath.split('/').pop() || 'audio.wav', {
      type: 'audio/wav',
    });

    // Call OpenAI Whisper API with verbose_json to get timestamps
    // Force English language to prevent misdetection (e.g., Welsh instead of English)
    const response = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
      language: 'en', // Force English transcription
    });

    const processingTime = Date.now() - startTime;

    // Parse response and create transcript turns
    const turns: TranscriptTurn[] = [];

    if (response.segments && Array.isArray(response.segments)) {
      // Simple speaker diarization heuristic:
      // - Alternating speakers based on pauses
      // - First speaker is assumed to be agent
      let currentSpeaker: 'agent' | 'customer' = 'agent';
      let lastEndTime = 0;

      response.segments.forEach((segment: any) => {
        // If there's a significant pause (>2 seconds), assume speaker change
        const pause = segment.start - lastEndTime;
        if (pause > 2 && lastEndTime > 0) {
          currentSpeaker = currentSpeaker === 'agent' ? 'customer' : 'agent';
        }

        turns.push({
          speaker: currentSpeaker,
          text: segment.text.trim(),
          timestamp: segment.start,
          confidence: 1 - (segment.no_speech_prob || 0),
        });

        lastEndTime = segment.end;
      });
    } else {
      // Fallback: single turn with full text
      turns.push({
        speaker: 'agent',
        text: response.text,
        timestamp: 0,
        confidence: 1,
      });
    }

    const transcript: Transcript = {
      callId,
      turns,
      durationSeconds: response.duration || 0,
      language: response.language,
      processingTime,
    };

    return transcript;
  } catch (error) {
    console.error('Whisper transcription error:', error);
    throw new Error(`Failed to transcribe audio: ${(error as Error).message}`);
  }
}

/**
 * Estimate transcription cost
 * @param durationSeconds - Audio duration in seconds
 * @returns Cost in USD
 */
export function estimateTranscriptionCost(durationSeconds: number): number {
  const hours = durationSeconds / 3600;
  const costPerHour = 0.36; // $0.36 per hour
  return hours * costPerHour;
}

/**
 * Format transcript as plain text for human reading
 * @param transcript - Transcript object
 * @returns Formatted text
 */
export function formatTranscriptAsText(transcript: Transcript): string {
  const lines: string[] = [];

  lines.push('='.repeat(80));
  lines.push('CALL TRANSCRIPT');
  lines.push('='.repeat(80));
  lines.push('');
  lines.push(`Call ID: ${transcript.callId}`);
  lines.push(`Duration: ${Math.floor(transcript.durationSeconds / 60)}m ${Math.floor(transcript.durationSeconds % 60)}s`);
  lines.push(`Language: ${transcript.language || 'Unknown'}`);
  lines.push(`Processing Time: ${Math.floor(transcript.processingTime! / 1000)}s`);
  lines.push('');
  lines.push('='.repeat(80));
  lines.push('');

  transcript.turns.forEach((turn, index) => {
    const timestamp = formatTimestamp(turn.timestamp);
    const speaker = turn.speaker === 'agent' ? 'AGENT' : 'CUSTOMER';
    const confidence = Math.round((turn.confidence || 0) * 100);

    lines.push(`[${timestamp}] ${speaker} (${confidence}% confidence)`);
    lines.push(turn.text);
    lines.push('');
  });

  return lines.join('\n');
}

/**
 * Format timestamp as MM:SS
 */
function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
