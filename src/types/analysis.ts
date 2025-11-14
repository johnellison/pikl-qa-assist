/**
 * Analysis Types
 * Represents AI-powered QA analysis results from Claude
 */

export type KeyMomentType = 'positive' | 'negative' | 'neutral';

export type QACategory =
  | 'rapport'
  | 'needsDiscovery'
  | 'productKnowledge'
  | 'objectionHandling'
  | 'closing'
  | 'compliance'
  | 'professionalism'
  | 'followUp'
  // UK Compliance Sub-Dimensions
  | 'callOpeningCompliance'
  | 'dataProtectionCompliance'
  | 'mandatoryDisclosures'
  | 'tcfCompliance'
  | 'salesProcessCompliance'
  | 'complaintsHandling';

export type CallType =
  | 'new_business_sales'
  | 'renewals'
  | 'mid_term_adjustment'
  | 'claims_inquiry'
  | 'complaints'
  | 'general_inquiry';

export interface KeyMoment {
  timestamp: number; // seconds from start
  type: KeyMomentType;
  category: string;
  description: string;
  quote: string; // Actual text from transcript
}

export interface QAScores {
  // Core QA Dimensions (7 dimensions)
  rapport: number; // 0-10
  needsDiscovery: number; // 0-10
  productKnowledge: number; // 0-10
  objectionHandling: number; // 0-10
  closing: number; // 0-10
  professionalism: number; // 0-10
  followUp: number; // 0-10

  // Legacy field - deprecated, no longer used in new analyses
  compliance?: number; // 0-10 (DEPRECATED: Use UK compliance dimensions instead)

  // UK Compliance Sub-Dimensions (0-10 each, null if not applicable)
  callOpeningCompliance: number; // Firm ID, call recording disclosure, GDPR notice
  dataProtectionCompliance: number; // DPA verification before accessing data
  mandatoryDisclosures: number; // Service type, remuneration, complaints procedure, cooling-off
  tcfCompliance: number; // Treating Customers Fairly - FCA Principle 6
  salesProcessCompliance: number | null; // Needs assessment, suitability, product info (null if not a sales call)
  complaintsHandling: number | null; // DISP compliance (null if not a complaint)
}

export interface ComplianceIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string; // e.g., 'dataProtectionCompliance', 'mandatoryDisclosures'
  issue: string; // Clear description of the violation
  regulatoryReference: string; // e.g., 'ICOBS 4.2', 'GDPR Article 13', 'FCA PRIN 6'
  timestamp: number | null; // seconds from start, null if not timestamp-specific
  remediation: string; // Specific action needed to fix
}

export interface Analysis {
  callId: string;
  callType?: CallType; // Auto-detected call type for tailored compliance checks
  overallScore: number; // 0-10, weighted average (70% QA + 30% Compliance)
  qaScore?: number; // 0-10, average of 7 core QA dimensions
  complianceScore?: number; // 0-10, average of UK compliance dimensions
  scores: QAScores;
  keyMoments: KeyMoment[];
  coachingRecommendations: string[];
  summary: string;
  callOutcome: string;
  outcomeMetrics?: {
    quotesCompleted: number;
    salesCompleted: number;
    renewalsCompleted: number;
  };
  complianceIssues: ComplianceIssue[]; // Enhanced compliance issue structure
  processingTime?: number; // ms taken to analyze
}

export interface AnalysisResponse {
  analysis: Analysis;
  rawResponse?: any; // Store raw Claude API response for debugging
}

// Helper type for scoring rubric
export interface ScoringCriteria {
  dimension: QACategory;
  description: string;
  scoreDefinitions: {
    range: string; // e.g., "8-10", "5-7", "0-4"
    description: string;
  }[];
}
