/**
 * Call Record Types
 * Represents a call recording with metadata and processing status
 */

export type CallStatus =
  | 'pending'
  | 'transcribing'
  | 'analyzing'
  | 'complete'
  | 'error';

export interface Call {
  id: string;
  filename: string;
  agentName: string;
  agentId: string;
  phoneNumber: string;
  callId: string;
  timestamp: Date;
  duration: number; // in seconds
  status: CallStatus;
  transcriptUrl?: string;
  analysisUrl?: string;
  overallScore?: number;
  callType?: 'new_business_sales' | 'renewals' | 'mid_term_adjustment' | 'claims_inquiry' | 'complaints' | 'general_inquiry';
  complianceScore?: number; // Average of UK compliance dimensions
  createdAt: Date;
  updatedAt: Date;
  errorMessage?: string;
}

export interface CallMetadata {
  agentName: string;
  agentId: string;
  phoneNumber: string;
  callId: string;
  timestamp: Date;
}
