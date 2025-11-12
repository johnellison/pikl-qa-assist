/**
 * Transcript Types
 * Represents transcribed audio with speaker diarization
 */

export type Speaker = 'agent' | 'customer';

export interface TranscriptTurn {
  speaker: Speaker;
  text: string;
  timestamp: number; // seconds from start
  confidence?: number; // 0-1 confidence score from Whisper
}

export interface Transcript {
  callId: string;
  turns: TranscriptTurn[];
  durationSeconds: number;
  language?: string;
  processingTime?: number; // ms taken to transcribe
}

export interface TranscriptionResponse {
  transcript: Transcript;
  rawResponse?: any; // Store raw Whisper API response for debugging
}
