import type { CallType } from './compliance-rules';

/**
 * QA Log Entry - Master register of all QA activities
 */
export interface QALogEntry {
  id: string; // unique ID
  qaNumber: string; // human-readable QA number (e.g., "QA-2024-11-001")
  callId: string; // reference to Call

  // Metadata
  month: string; // "2024-11"
  agentName: string;
  agentId: string;
  auditorName: string; // "AI" or human name
  dateOfCall: string; // ISO date string

  // Call details
  reference: string; // call.filename or call.id
  source: 'inbound' | 'outbound';
  callType: CallType;
  product: string; // "home", "motor", "commercial", etc.
  insurer: string; // "Pikl" or underwriter

  // Analysis summary
  summary: string;

  // Scores
  overallScore: number; // 0-10
  internalScore: 1 | 2 | 3 | 4 | 5; // calculated from compliance + overall
  mandatoryCompliance: 'pass' | 'fail';

  // Manual fields (editable by QA managers)
  mainFeedbackArea: string;
  actionRequired: boolean;
  actionTaken: string | null;
  dateClosed: string | null; // ISO date string

  // Links
  callUrl: string; // /calls/[id]

  // Audit trail
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  updatedBy: string; // user who made manual edits
}

/**
 * QA Log filters for querying
 */
export interface QALogFilters {
  startDate?: string;
  endDate?: string;
  agentId?: string;
  agentName?: string;
  auditorName?: string;
  callType?: CallType;
  complianceStatus?: 'pass' | 'fail';
  internalScore?: 1 | 2 | 3 | 4 | 5;
  actionRequired?: boolean;
  status?: 'open' | 'closed'; // open = dateClosed is null
}

/**
 * Update payload for manual fields
 */
export interface QALogUpdatePayload {
  mainFeedbackArea?: string;
  actionRequired?: boolean;
  actionTaken?: string | null;
  dateClosed?: string | null;
}
