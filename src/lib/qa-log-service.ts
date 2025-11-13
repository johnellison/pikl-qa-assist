import { promises as fs } from 'fs';
import path from 'path';
import type { Call, CallAnalysis } from '@/types/call';
import type { QALogEntry, QALogFilters, QALogUpdatePayload } from '@/types/qa-log';

const QA_LOG_FILE = path.join(process.cwd(), 'data', 'qa-log.json');

/**
 * Calculate internal score (1-5) based on compliance failures and overall score
 *
 * Internal Score Key:
 * 1 = 2 or more compliance fails
 * 2 = 1 compliance fail, score under 85%
 * 3 = 1 compliance fail, score over 85% OR no compliance fails, score under 85%
 * 4 = No compliance fails, score over 85% (TARGET)
 * 5 = No compliance fails, score over 95%
 */
export function calculateInternalScore(analysis: CallAnalysis): 1 | 2 | 3 | 4 | 5 {
  const complianceFails = analysis.complianceIssues.filter(
    (issue) => issue.severity === 'critical' || issue.severity === 'high'
  ).length;

  const overallPercentage = (analysis.overallScore / 10) * 100;

  if (complianceFails >= 2) return 1;
  if (complianceFails === 1 && overallPercentage < 85) return 2;
  if (complianceFails === 1 && overallPercentage >= 85) return 3;
  if (complianceFails === 0 && overallPercentage < 85) return 3;
  if (complianceFails === 0 && overallPercentage >= 85 && overallPercentage < 95) return 4;
  if (complianceFails === 0 && overallPercentage >= 95) return 5;

  return 3; // default fallback
}

/**
 * Determine mandatory compliance pass/fail
 *
 * FAIL if any critical or high severity compliance issues exist
 * PASS otherwise
 */
export function calculateMandatoryCompliance(analysis: CallAnalysis): 'pass' | 'fail' {
  const criticalOrHighIssues = analysis.complianceIssues.filter(
    (issue) => issue.severity === 'critical' || issue.severity === 'high'
  );

  return criticalOrHighIssues.length === 0 ? 'pass' : 'fail';
}

/**
 * Generate unique QA number in format: QA-YYYY-MM-NNN
 * Example: QA-2024-11-001
 */
export async function generateQANumber(dateOfCall: string): Promise<string> {
  const date = new Date(dateOfCall);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const prefix = `QA-${year}-${month}-`;

  // Read existing log to find next number
  const entries = await readQALog();
  const existingNumbers = entries
    .filter((e) => e.qaNumber.startsWith(prefix))
    .map((e) => {
      const match = e.qaNumber.match(/-(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    });

  const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
}

/**
 * Extract product from call metadata or filename
 * This is a simple heuristic - can be enhanced based on actual data
 */
function extractProduct(call: Call): string {
  // Check filename for product indicators
  const filename = call.filename.toLowerCase();
  if (filename.includes('home')) return 'Home';
  if (filename.includes('motor') || filename.includes('vehicle')) return 'Motor';
  if (filename.includes('commercial') || filename.includes('business')) return 'Commercial';
  if (filename.includes('travel')) return 'Travel';
  if (filename.includes('pet')) return 'Pet';

  // Default
  return 'Unknown';
}

/**
 * Determine source (inbound/outbound) from call metadata
 * Default to inbound if not specified
 */
function extractSource(call: Call): 'inbound' | 'outbound' {
  // This could be enhanced based on actual metadata in filename or other fields
  return 'inbound'; // default assumption
}

/**
 * Create QA Log entry from Call and Analysis
 */
export async function createQALogEntry(call: Call, analysis: CallAnalysis): Promise<QALogEntry> {
  const qaNumber = await generateQANumber(call.timestamp);
  const date = new Date(call.timestamp);
  const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

  // Extract main feedback area from coaching recommendations
  const mainFeedbackArea =
    analysis.coachingRecommendations && analysis.coachingRecommendations.length > 0
      ? analysis.coachingRecommendations[0]
      : 'No specific feedback area identified';

  const entry: QALogEntry = {
    id: call.id,
    qaNumber,
    callId: call.id,

    // Metadata
    month,
    agentName: call.agentName,
    agentId: call.agentId,
    auditorName: 'AI', // Default to AI, can be updated manually later
    dateOfCall: call.timestamp,

    // Call details
    reference: call.filename,
    source: extractSource(call),
    callType: analysis.callType || 'general_inquiry',
    product: extractProduct(call),
    insurer: 'Pikl', // Default

    // Analysis
    summary: analysis.summary || '',

    // Scores
    overallScore: analysis.overallScore,
    internalScore: calculateInternalScore(analysis),
    mandatoryCompliance: calculateMandatoryCompliance(analysis),

    // Manual fields (defaults)
    mainFeedbackArea,
    actionRequired: calculateMandatoryCompliance(analysis) === 'fail', // Auto-flag failures
    actionTaken: null,
    dateClosed: null,

    // Links
    callUrl: `/calls/${call.id}`,

    // Audit trail
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: 'system',
  };

  return entry;
}

/**
 * Read all QA Log entries from storage
 */
export async function readQALog(): Promise<QALogEntry[]> {
  try {
    const data = await fs.readFile(QA_LOG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist yet, return empty array
    return [];
  }
}

/**
 * Write QA Log entries to storage
 */
async function writeQALog(entries: QALogEntry[]): Promise<void> {
  const dir = path.dirname(QA_LOG_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(QA_LOG_FILE, JSON.stringify(entries, null, 2), 'utf-8');
}

/**
 * Add or update QA Log entry
 */
export async function upsertQALogEntry(entry: QALogEntry): Promise<void> {
  const entries = await readQALog();
  const existingIndex = entries.findIndex((e) => e.callId === entry.callId);

  if (existingIndex >= 0) {
    // Update existing
    entries[existingIndex] = {
      ...entries[existingIndex],
      ...entry,
      updatedAt: new Date().toISOString(),
    };
  } else {
    // Add new
    entries.push(entry);
  }

  // Sort by date descending
  entries.sort((a, b) => new Date(b.dateOfCall).getTime() - new Date(a.dateOfCall).getTime());

  await writeQALog(entries);
}

/**
 * Update manual fields in QA Log entry
 */
export async function updateQALogEntry(
  qaNumber: string,
  updates: QALogUpdatePayload,
  updatedBy: string = 'user'
): Promise<QALogEntry | null> {
  const entries = await readQALog();
  const entry = entries.find((e) => e.qaNumber === qaNumber);

  if (!entry) {
    return null;
  }

  // Apply updates
  Object.assign(entry, updates, {
    updatedAt: new Date().toISOString(),
    updatedBy,
  });

  await writeQALog(entries);
  return entry;
}

/**
 * Filter QA Log entries based on criteria
 */
export function filterQALog(entries: QALogEntry[], filters: QALogFilters): QALogEntry[] {
  return entries.filter((entry) => {
    // Date range
    if (filters.startDate && new Date(entry.dateOfCall) < new Date(filters.startDate)) {
      return false;
    }
    if (filters.endDate && new Date(entry.dateOfCall) > new Date(filters.endDate)) {
      return false;
    }

    // Agent
    if (filters.agentId && entry.agentId !== filters.agentId) {
      return false;
    }
    if (filters.agentName && !entry.agentName.toLowerCase().includes(filters.agentName.toLowerCase())) {
      return false;
    }

    // Auditor
    if (filters.auditorName && !entry.auditorName.toLowerCase().includes(filters.auditorName.toLowerCase())) {
      return false;
    }

    // Call type
    if (filters.callType && entry.callType !== filters.callType) {
      return false;
    }

    // Compliance
    if (filters.complianceStatus && entry.mandatoryCompliance !== filters.complianceStatus) {
      return false;
    }

    // Internal score
    if (filters.internalScore && entry.internalScore !== filters.internalScore) {
      return false;
    }

    // Action required
    if (filters.actionRequired !== undefined && entry.actionRequired !== filters.actionRequired) {
      return false;
    }

    // Status (open/closed)
    if (filters.status === 'open' && entry.dateClosed !== null) {
      return false;
    }
    if (filters.status === 'closed' && entry.dateClosed === null) {
      return false;
    }

    return true;
  });
}

/**
 * Sync QA Log with all completed calls
 * Creates entries for any calls that don't have log entries yet
 */
export async function syncQALog(calls: Call[]): Promise<void> {
  const existingEntries = await readQALog();
  const existingCallIds = new Set(existingEntries.map((e) => e.callId));

  for (const call of calls) {
    // Only process completed calls with analysis
    if (call.status !== 'complete' || !call.analysisUrl) {
      continue;
    }

    // Skip if already in log
    if (existingCallIds.has(call.id)) {
      continue;
    }

    try {
      // Load analysis
      const analysisPath = path.join(process.cwd(), call.analysisUrl.replace(/^\//, ''));
      const analysisData = await fs.readFile(analysisPath, 'utf-8');
      const analysis: CallAnalysis = JSON.parse(analysisData);

      // Create QA Log entry
      const entry = await createQALogEntry(call, analysis);
      await upsertQALogEntry(entry);
    } catch (error) {
      console.error(`Failed to create QA Log entry for call ${call.id}:`, error);
    }
  }
}
