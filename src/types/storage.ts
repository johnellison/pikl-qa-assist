/**
 * Storage Types
 * Data models for file-based storage system
 */

import type { Transcript, Analysis } from './index';

export type CallStatus = 'uploaded' | 'transcribing' | 'transcribed' | 'analyzing' | 'analyzed' | 'error';

export interface CallRecord {
  id: string; // Unique call ID
  filename: string; // Original audio filename
  filepath: string; // Path to audio file
  uploadedAt: Date;
  status: CallStatus;
  metadata?: CallMetadata;
  transcriptId?: string; // References transcript file
  analysisId?: string; // References analysis file
  error?: string; // Error message if status is 'error'
}

export interface CallMetadata {
  agentName?: string;
  agentId?: string;
  customerPhone?: string;
  timestamp?: Date;
  duration?: number; // seconds
  fileSize?: number; // bytes
}

export interface StoredTranscript {
  id: string; // Same as callId
  callId: string;
  transcript: Transcript;
  storedAt: Date;
}

export interface StoredAnalysis {
  id: string; // Same as callId
  callId: string;
  analysis: Analysis;
  storedAt: Date;
}

// List responses
export interface CallListResponse {
  calls: CallRecord[];
  total: number;
}

export interface StorageStats {
  totalCalls: number;
  uploadedCalls: number;
  transcribedCalls: number;
  analyzedCalls: number;
  errorCalls: number;
  totalStorageBytes: number;
}
