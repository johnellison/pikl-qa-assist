/**
 * Storage Layer - Now using SQLite Database via Prisma
 *
 * This module exports the database storage functions.
 * The old JSON storage implementation has been moved to storage-json.ts
 */

export {
  ensureDirectories,
  readCalls,
  writeCalls,
  addCall,
  getCallById,
  updateCall,
  saveUploadedFile,
  getUploadPath,
  fileExists,
  generateCallId,
  saveTranscript,
  saveTranscriptAsText,
  getTranscript,
  getTranscriptText,
  saveAnalysis,
  getAnalysis,
  getCompleteCallData,
  deleteCall,
  getStorageStats,
} from './db-storage';

// Re-export types for convenience
export type { Call, Analysis, Transcript } from '@/types';
