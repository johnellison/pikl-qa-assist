/**
 * Compliance Rules System
 * Allows configuring which compliance requirements apply to different call types
 */

export type CallType =
  | 'new_business_sales'
  | 'renewals'
  | 'mid_term_adjustment'
  | 'claims_inquiry'
  | 'complaints'
  | 'general_inquiry';

export type ComplianceDimension =
  | 'callOpeningCompliance'
  | 'dataProtectionCompliance'
  | 'mandatoryDisclosures'
  | 'tcfCompliance'
  | 'salesProcessCompliance'
  | 'complaintsHandling';

export type RuleSeverity = 'critical' | 'high' | 'medium' | 'low';

/**
 * Individual compliance rule
 */
export interface ComplianceRule {
  id: string;
  dimension: ComplianceDimension;
  title: string;
  description: string;
  regulatoryReference: string; // e.g., "GDPR Article 13", "ICOBS 4.2.1R"
  requirement: string; // What the agent must do
  exampleScript?: string; // Example of compliant language
  severity: RuleSeverity;

  // Which call types this rule applies to
  applicableCallTypes: CallType[];

  // Active/inactive toggle
  enabled: boolean;

  // Metadata
  createdAt: string;
  updatedAt: string;
  notes?: string; // Internal notes for compliance team
}

/**
 * Full compliance rules configuration
 */
export interface ComplianceRulesConfig {
  version: string;
  lastUpdatedBy?: string;
  lastUpdatedAt: string;
  rules: ComplianceRule[];
}

/**
 * Helper type for rule filtering
 */
export interface RuleFilter {
  dimension?: ComplianceDimension;
  callType?: CallType;
  severity?: RuleSeverity;
  enabled?: boolean;
}
