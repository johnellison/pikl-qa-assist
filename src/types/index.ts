/**
 * Central export for all TypeScript types
 */

// Call types
export type {
  Call,
  CallStatus,
  CallMetadata,
} from './call';

// Transcript types
export type {
  Transcript,
  TranscriptTurn,
  Speaker,
  TranscriptionResponse,
} from './transcript';

// Analysis types
export type {
  Analysis,
  AnalysisResponse,
  QAScores,
  QACategory,
  KeyMoment,
  KeyMomentType,
  ScoringCriteria,
  CallType,
  ComplianceIssue,
} from './analysis';

// Storage types
export type {
  CallRecord,
  CallListResponse,
  StoredTranscript,
  StoredAnalysis,
  StorageStats,
} from './storage';
export type { CallStatus as StorageCallStatus } from './storage';

// Import types for use in this file
import type { Call, CallStatus } from './call';
import type { QAScores, QACategory } from './analysis';

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Filter types for dashboard
export interface CallFilters {
  agentId?: string;
  agentName?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minScore?: number;
  maxScore?: number;
  status?: CallStatus;
  searchQuery?: string;
}

export interface SortOptions {
  field: keyof Call;
  direction: 'asc' | 'desc';
}

// Agent performance types
export interface AgentStats {
  agentId: string;
  agentName: string;
  totalCalls: number;
  averageScore: number;
  scoresByDimension: Partial<QAScores>;
  trend: 'improving' | 'declining' | 'stable';
  topStrengths: QACategory[];
  areasForImprovement: QACategory[];
  lastCallDate: Date;
}

export interface AgentPerformance {
  agent: AgentStats;
  recentCalls: Call[];
  scoreHistory: {
    date: Date;
    score: number;
  }[];
}

// Upload types
export interface UploadProgress {
  filename: string;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  callId?: string;
  error?: string;
}

export interface BatchUploadStatus {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
  uploads: UploadProgress[];
}

