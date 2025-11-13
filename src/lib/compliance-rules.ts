import type {
  ComplianceRule,
  ComplianceRulesConfig,
  CallType,
  RuleFilter,
} from '@/types/compliance-rules';

/**
 * Default UK Insurance Compliance Rules
 *
 * These rules can be customized by compliance managers via the admin UI.
 * Rules are applied dynamically based on call type.
 */
export const DEFAULT_COMPLIANCE_RULES: ComplianceRule[] = [
  // ===== CALL OPENING COMPLIANCE =====
  {
    id: 'call-opening-001',
    dimension: 'callOpeningCompliance',
    title: 'Call Recording Disclosure',
    description: 'Agent must inform customer that the call is being recorded',
    regulatoryReference: 'DPA 2018 Section 4',
    requirement: 'State clearly that call is being recorded for quality and training purposes',
    exampleScript: 'This call is being recorded for quality assurance and training purposes.',
    severity: 'critical',
    applicableCallTypes: [
      'new_business_sales',
      'renewals',
      'mid_term_adjustment',
      'claims_inquiry',
      'complaints',
      'general_inquiry',
    ],
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: 'Required for ALL call types under UK data protection law',
  },
  {
    id: 'call-opening-002',
    dimension: 'callOpeningCompliance',
    title: 'Agent Introduction',
    description: 'Agent must identify themselves and the company',
    regulatoryReference: 'ICOBS 2.2.2R',
    requirement: 'State agent name and company name clearly',
    exampleScript: 'Good morning, my name is Sarah and I\'m calling from Pikl Insurance.',
    severity: 'high',
    applicableCallTypes: [
      'new_business_sales',
      'renewals',
      'mid_term_adjustment',
      'claims_inquiry',
      'complaints',
      'general_inquiry',
    ],
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ===== DATA PROTECTION COMPLIANCE =====
  {
    id: 'data-protection-001',
    dimension: 'dataProtectionCompliance',
    title: 'Full GDPR Privacy Notice (New Business)',
    description: 'Full privacy notice required for new customer relationships',
    regulatoryReference: 'GDPR Article 13',
    requirement:
      'Provide comprehensive privacy notice including: data collection purpose, lawful basis, retention period, and customer rights (access, rectification, erasure)',
    exampleScript:
      'We collect and process your personal data to provide insurance services. You have the right to access, correct, or delete your data. For our full privacy policy, please visit our website or ask us to send it by post.',
    severity: 'critical',
    applicableCallTypes: ['new_business_sales'],
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: 'Full notice required ONLY for new business - first contact with customer',
  },
  {
    id: 'data-protection-002',
    dimension: 'dataProtectionCompliance',
    title: 'Abbreviated Privacy Notice (Renewals)',
    description: 'Brief acknowledgment acceptable for existing customers',
    regulatoryReference: 'GDPR Article 13',
    requirement:
      'Acknowledge data already held: "This is a renewal, we already have your details on file" OR "Your data is held in accordance with our privacy policy"',
    exampleScript:
      'As this is a renewal, we already have your details on file and they\'re held in accordance with our privacy policy.',
    severity: 'medium',
    applicableCallTypes: ['renewals', 'mid_term_adjustment', 'general_inquiry'],
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes:
      'Abbreviated notice is COMPLIANT for existing customer relationships - DO NOT require full notice',
  },
  {
    id: 'data-protection-003',
    dimension: 'dataProtectionCompliance',
    title: 'DPA Verification Before Data Access',
    description: 'Verify customer identity before accessing or discussing policy details',
    regulatoryReference: 'DPA 2018 Section 2',
    requirement:
      'Ask at least 2 security questions before accessing customer data (e.g., date of birth, postcode, policy number)',
    exampleScript:
      'Before I access your policy, I need to verify your identity. Can you confirm your date of birth and postcode?',
    severity: 'critical',
    applicableCallTypes: [
      'renewals',
      'mid_term_adjustment',
      'claims_inquiry',
      'complaints',
      'general_inquiry',
    ],
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: 'Required for existing customer calls to prevent unauthorized data access',
  },

  // ===== MANDATORY DISCLOSURES =====
  {
    id: 'mandatory-disclosures-001',
    dimension: 'mandatoryDisclosures',
    title: 'Cooling-Off Period (14 Days)',
    description: 'Customer must be informed of their right to cancel within 14 days',
    regulatoryReference: 'ICOBS 6.1.5R',
    requirement:
      'State that customer has 14 days to cancel and receive a full refund (pro-rata if cover has started)',
    exampleScript:
      'You have a 14-day cooling-off period where you can cancel for a full refund if cover hasn\'t started, or a pro-rata refund if it has.',
    severity: 'high',
    applicableCallTypes: ['new_business_sales', 'renewals'],
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mandatory-disclosures-002',
    dimension: 'mandatoryDisclosures',
    title: 'Policy Documents Timeline',
    description: 'Customer must be told when they will receive policy documents',
    regulatoryReference: 'ICOBS 6.1.5R',
    requirement:
      'State when customer will receive: policy schedule, statement of facts, insurance product information document (IPID)',
    exampleScript:
      'You\'ll receive your policy documents by email within 24 hours, including your policy schedule and insurance product information document.',
    severity: 'high',
    applicableCallTypes: ['new_business_sales', 'renewals', 'mid_term_adjustment'],
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mandatory-disclosures-003',
    dimension: 'mandatoryDisclosures',
    title: 'Claims Process Information',
    description: 'Customer must understand how to make a claim',
    regulatoryReference: 'ICOBS 6.1.5R',
    requirement: 'Explain claims process: how to report, expected timeline, what information is needed',
    exampleScript:
      'If you need to make a claim, you can call our 24/7 claims line. We\'ll need details of the incident and any supporting evidence like photos or police reports.',
    severity: 'medium',
    applicableCallTypes: ['new_business_sales', 'renewals'],
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ===== TREATING CUSTOMERS FAIRLY (TCF) =====
  {
    id: 'tcf-001',
    dimension: 'tcfCompliance',
    title: 'Needs-Based Selling',
    description: 'Product recommendations must be based on customer needs assessment',
    regulatoryReference: 'FCA PRIN 6',
    requirement:
      'Ask discovery questions about customer situation, assess needs, recommend appropriate cover levels',
    exampleScript:
      'To make sure we recommend the right cover for you, can you tell me about your business? How many employees do you have? What are your main activities?',
    severity: 'high',
    applicableCallTypes: ['new_business_sales', 'renewals', 'mid_term_adjustment'],
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tcf-002',
    dimension: 'tcfCompliance',
    title: 'No Pressure Selling',
    description: 'Customer must not feel pressured or rushed into a decision',
    regulatoryReference: 'FCA PRIN 6',
    requirement:
      'Avoid phrases like "today only", "limited time", excessive urgency. Offer time to consider.',
    exampleScript:
      'Take your time to think about this. Would you like me to send the quote by email so you can review it?',
    severity: 'critical',
    applicableCallTypes: ['new_business_sales', 'renewals'],
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: 'Pressure selling is a serious TCF breach - always flag',
  },
  {
    id: 'tcf-003',
    dimension: 'tcfCompliance',
    title: 'Clear Pricing Breakdown',
    description: 'Customer must understand what they are paying and why',
    regulatoryReference: 'ICOBS 6.1.9R',
    requirement:
      'Explain premium breakdown: base premium, any optional extras, taxes/fees (Insurance Premium Tax)',
    exampleScript:
      'Your total premium is £450 per year. That includes £385 for the cover, £50 for legal expenses cover, and £15 Insurance Premium Tax.',
    severity: 'high',
    applicableCallTypes: ['new_business_sales', 'renewals', 'mid_term_adjustment'],
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ===== SALES PROCESS COMPLIANCE =====
  {
    id: 'sales-process-001',
    dimension: 'salesProcessCompliance',
    title: 'Key Policy Exclusions',
    description: 'Customer must be made aware of significant exclusions and limitations',
    regulatoryReference: 'ICOBS 6.1.5R',
    requirement:
      'Highlight 2-3 main exclusions relevant to customer (e.g., pre-existing conditions, wear and tear, terrorism)',
    exampleScript:
      'Important to note: this policy doesn\'t cover pre-existing medical conditions or wear and tear. Claims arising from acts of terrorism are also excluded.',
    severity: 'high',
    applicableCallTypes: ['new_business_sales', 'renewals'],
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sales-process-002',
    dimension: 'salesProcessCompliance',
    title: 'Fair Presentation of Risk',
    description: 'Customer must accurately disclose all material facts',
    regulatoryReference: 'Insurance Act 2015',
    requirement:
      'Remind customer of duty to disclose all material information accurately (e.g., claims history, business activities)',
    exampleScript:
      'It\'s important that you provide accurate information. Any claims in the last 5 years? Any changes to your business activities since you took out the policy?',
    severity: 'high',
    applicableCallTypes: ['new_business_sales', 'renewals', 'mid_term_adjustment'],
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ===== COMPLAINTS HANDLING =====
  {
    id: 'complaints-001',
    dimension: 'complaintsHandling',
    title: 'Complaint Recognition',
    description: 'Expression of dissatisfaction must be recognized as a complaint',
    regulatoryReference: 'DISP 1.2.1R',
    requirement:
      'If customer expresses dissatisfaction, acknowledge as formal complaint (don\'t dismiss or downplay)',
    exampleScript:
      'I understand you\'re unhappy with how this has been handled. I\'m going to log this as a formal complaint so we can investigate properly.',
    severity: 'critical',
    applicableCallTypes: ['complaints', 'claims_inquiry', 'general_inquiry'],
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: 'Dismissing or discouraging complaints is a serious breach',
  },
  {
    id: 'complaints-002',
    dimension: 'complaintsHandling',
    title: '8-Week Resolution Timeline',
    description: 'Customer must be told complaint will be resolved within 8 weeks',
    regulatoryReference: 'DISP 1.6.2R',
    requirement: 'State that complaint will be investigated and resolved within 8 weeks',
    exampleScript:
      'We\'ll investigate your complaint and provide a full response within 8 weeks. You\'ll receive a reference number by email shortly.',
    severity: 'high',
    applicableCallTypes: ['complaints'],
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'complaints-003',
    dimension: 'complaintsHandling',
    title: 'Financial Ombudsman Service (FOS) Rights',
    description: 'Customer must be informed of right to escalate to FOS',
    regulatoryReference: 'DISP 1.6.2R',
    requirement:
      'Inform customer they can escalate to FOS if unhappy with final response (free, independent service)',
    exampleScript:
      'If you\'re not satisfied with our response, you can refer your complaint to the Financial Ombudsman Service free of charge.',
    severity: 'critical',
    applicableCallTypes: ['complaints'],
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Get rules applicable to a specific call type
 */
export function getRulesForCallType(callType: CallType): ComplianceRule[] {
  return DEFAULT_COMPLIANCE_RULES.filter(
    (rule) => rule.enabled && rule.applicableCallTypes.includes(callType)
  );
}

/**
 * Filter rules based on criteria
 */
export function filterRules(filter: RuleFilter): ComplianceRule[] {
  return DEFAULT_COMPLIANCE_RULES.filter((rule) => {
    if (filter.dimension && rule.dimension !== filter.dimension) return false;
    if (filter.callType && !rule.applicableCallTypes.includes(filter.callType)) return false;
    if (filter.severity && rule.severity !== filter.severity) return false;
    if (filter.enabled !== undefined && rule.enabled !== filter.enabled) return false;
    return true;
  });
}

/**
 * Generate compliance prompt section based on active rules for call type
 */
export function generateCompliancePrompt(callType: CallType): string {
  const rules = getRulesForCallType(callType);

  // Group rules by dimension
  const rulesByDimension: Record<string, ComplianceRule[]> = {};
  rules.forEach((rule) => {
    if (!rulesByDimension[rule.dimension]) {
      rulesByDimension[rule.dimension] = [];
    }
    rulesByDimension[rule.dimension].push(rule);
  });

  let prompt = `**ACTIVE COMPLIANCE RULES FOR ${callType.toUpperCase().replace(/_/g, ' ')}**:\n\n`;

  Object.entries(rulesByDimension).forEach(([dimension, dimensionRules]) => {
    prompt += `**${dimension}**:\n`;
    dimensionRules.forEach((rule) => {
      prompt += `  ✅ ${rule.title} (${rule.severity.toUpperCase()})\n`;
      prompt += `     ${rule.requirement}\n`;
      if (rule.exampleScript) {
        prompt += `     Example: "${rule.exampleScript}"\n`;
      }
      prompt += `     Regulatory Reference: ${rule.regulatoryReference}\n\n`;
    });
  });

  return prompt;
}

/**
 * Load compliance rules configuration from file system
 */
export async function loadComplianceRules(): Promise<ComplianceRulesConfig> {
  // For MVP, return default rules
  // In production, this would read from JSON file or database
  return {
    version: '1.0.0',
    lastUpdatedAt: new Date().toISOString(),
    rules: DEFAULT_COMPLIANCE_RULES,
  };
}

/**
 * Save compliance rules configuration to file system
 */
export async function saveComplianceRules(config: ComplianceRulesConfig): Promise<void> {
  // For MVP, this is a placeholder
  // In production, this would write to JSON file or database
  console.log('Saving compliance rules:', config);
}
