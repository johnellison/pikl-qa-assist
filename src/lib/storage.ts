import fs from 'fs/promises';
import path from 'path';
import type { Call, Transcript } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const CALLS_FILE = path.join(DATA_DIR, 'calls', 'calls.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const TRANSCRIPTS_DIR = path.join(DATA_DIR, 'transcripts');
const ANALYSES_DIR = path.join(DATA_DIR, 'analyses');

/**
 * Ensure required directories exist
 */
export async function ensureDirectories() {
  await fs.mkdir(path.join(DATA_DIR, 'calls'), { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.mkdir(TRANSCRIPTS_DIR, { recursive: true });
  await fs.mkdir(ANALYSES_DIR, { recursive: true });
}

/**
 * Read all calls from JSON storage
 */
export async function readCalls(): Promise<Call[]> {
  try {
    const data = await fs.readFile(CALLS_FILE, 'utf-8');
    const calls = JSON.parse(data);

    // Remove duplicates based on ID (keep first occurrence)
    const seen = new Set<string>();
    const uniqueCalls = calls.filter((call: Call) => {
      if (seen.has(call.id)) {
        return false;
      }
      seen.add(call.id);
      return true;
    });

    // If duplicates were found, write the deduplicated list back
    if (uniqueCalls.length !== calls.length) {
      console.log(`Removed ${calls.length - uniqueCalls.length} duplicate call(s)`);
      await writeCalls(uniqueCalls);
    }

    // Enrich calls with analysis data (callType and complianceScore)
    const enrichedCalls = await Promise.all(
      uniqueCalls.map(async (call: Call) => {
        if (call.analysisUrl && call.status === 'complete') {
          try {
            const analysisPath = path.join(process.cwd(), call.analysisUrl.replace(/^\//, ''));
            const analysisData = await fs.readFile(analysisPath, 'utf-8');
            const analysis = JSON.parse(analysisData);

            // Calculate compliance score average
            let complianceScore: number | undefined = undefined;
            if (analysis.scores) {
              const complianceScores = [
                analysis.scores.callOpeningCompliance,
                analysis.scores.dataProtectionCompliance,
                analysis.scores.mandatoryDisclosures,
                analysis.scores.tcfCompliance,
              ].filter((score): score is number => typeof score === 'number');

              // Add optional compliance dimensions if present
              if (typeof analysis.scores.salesProcessCompliance === 'number') {
                complianceScores.push(analysis.scores.salesProcessCompliance);
              }
              if (typeof analysis.scores.complaintsHandling === 'number') {
                complianceScores.push(analysis.scores.complaintsHandling);
              }

              if (complianceScores.length > 0) {
                complianceScore = complianceScores.reduce((a, b) => a + b, 0) / complianceScores.length;
              }
            }

            return {
              ...call,
              callType: analysis.callType,
              complianceScore,
            };
          } catch (error) {
            // If analysis file doesn't exist or can't be read, just return call as-is
            return call;
          }
        }
        return call;
      })
    );

    // Sort by updatedAt descending (most recent first)
    const sortedCalls = enrichedCalls.sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return dateB - dateA; // Descending order
    });

    return sortedCalls;
  } catch (error) {
    // If file doesn't exist, return empty array
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// Mutex lock for preventing concurrent writes
let writeQueue: Promise<void> = Promise.resolve();

/**
 * Write calls to JSON storage with mutex lock to prevent corruption
 */
export async function writeCalls(calls: Call[]): Promise<void> {
  // Wait for any pending writes to complete
  await writeQueue;

  // Queue this write operation
  writeQueue = (async () => {
    try {
      await ensureDirectories();
      await fs.writeFile(CALLS_FILE, JSON.stringify(calls, null, 2), 'utf-8');
    } catch (error) {
      console.error('[STORAGE] Failed to write calls:', error);
      throw error;
    }
  })();

  await writeQueue;
}

/**
 * Add a new call record
 */
export async function addCall(call: Call): Promise<Call> {
  const calls = await readCalls();

  // Check if call already exists
  const existingIndex = calls.findIndex((c) => c.id === call.id);
  if (existingIndex !== -1) {
    // Update existing call instead of adding duplicate
    calls[existingIndex] = call;
  } else {
    calls.push(call);
  }

  await writeCalls(calls);
  return call;
}

/**
 * Get call by ID
 */
export async function getCallById(id: string): Promise<Call | null> {
  const calls = await readCalls();
  return calls.find((call) => call.id === id) || null;
}

/**
 * Update call record
 */
export async function updateCall(id: string, updates: Partial<Call>): Promise<Call | null> {
  const calls = await readCalls();
  const index = calls.findIndex((call) => call.id === id);

  if (index === -1) {
    return null;
  }

  calls[index] = {
    ...calls[index],
    ...updates,
    updatedAt: new Date(),
  };

  await writeCalls(calls);
  return calls[index];
}

/**
 * Save uploaded file
 */
export async function saveUploadedFile(
  buffer: Buffer,
  filename: string
): Promise<string> {
  await ensureDirectories();
  const filepath = path.join(UPLOADS_DIR, filename);
  await fs.writeFile(filepath, buffer);
  return filepath;
}

/**
 * Get upload path for a file
 */
export function getUploadPath(filename: string): string {
  return path.join(UPLOADS_DIR, filename);
}

/**
 * Check if file exists
 */
export async function fileExists(filename: string): Promise<boolean> {
  try {
    await fs.access(getUploadPath(filename));
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate unique call ID
 */
export function generateCallId(): string {
  return `call_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Save transcript to JSON file
 */
export async function saveTranscript(transcript: Transcript): Promise<void> {
  await ensureDirectories();
  const jsonPath = path.join(TRANSCRIPTS_DIR, `${transcript.callId}.json`);
  await fs.writeFile(jsonPath, JSON.stringify(transcript, null, 2), 'utf-8');
}

/**
 * Save transcript as plain text
 */
export async function saveTranscriptAsText(callId: string, textContent: string): Promise<void> {
  await ensureDirectories();
  const txtPath = path.join(TRANSCRIPTS_DIR, `${callId}.txt`);
  await fs.writeFile(txtPath, textContent, 'utf-8');
}

/**
 * Get transcript by call ID
 */
export async function getTranscript(callId: string): Promise<Transcript | null> {
  try {
    const jsonPath = path.join(TRANSCRIPTS_DIR, `${callId}.json`);
    const data = await fs.readFile(jsonPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Get transcript text by call ID
 */
export async function getTranscriptText(callId: string): Promise<string | null> {
  try {
    const txtPath = path.join(TRANSCRIPTS_DIR, `${callId}.txt`);
    return await fs.readFile(txtPath, 'utf-8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Save analysis to JSON file
 */
export async function saveAnalysis(analysis: any): Promise<void> {
  await ensureDirectories();
  const jsonPath = path.join(ANALYSES_DIR, `${analysis.callId}.json`);
  await fs.writeFile(jsonPath, JSON.stringify(analysis, null, 2), 'utf-8');
}

/**
 * Get analysis by call ID
 */
export async function getAnalysis(callId: string): Promise<any | null> {
  try {
    const jsonPath = path.join(ANALYSES_DIR, `${callId}.json`);
    const data = await fs.readFile(jsonPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Get complete call data (call + transcript + analysis)
 */
export async function getCompleteCallData(callId: string): Promise<{
  call: Call | null;
  transcript: Transcript | null;
  analysis: any | null;
}> {
  const [call, transcript, analysis] = await Promise.all([
    getCallById(callId),
    getTranscript(callId),
    getAnalysis(callId),
  ]);

  return { call, transcript, analysis };
}

/**
 * Delete call and all associated data
 */
export async function deleteCall(callId: string): Promise<boolean> {
  try {
    // Remove from calls.json
    const calls = await readCalls();
    const filtered = calls.filter((call) => call.id !== callId);
    await writeCalls(filtered);

    // Delete transcript files
    try {
      await fs.unlink(path.join(TRANSCRIPTS_DIR, `${callId}.json`));
    } catch {}
    try {
      await fs.unlink(path.join(TRANSCRIPTS_DIR, `${callId}.txt`));
    } catch {}

    // Delete analysis file
    try {
      await fs.unlink(path.join(ANALYSES_DIR, `${callId}.json`));
    } catch {}

    // Delete uploaded audio file (if exists)
    const call = await getCallById(callId);
    if (call?.filename) {
      try {
        await fs.unlink(getUploadPath(call.filename));
      } catch {}
    }

    return true;
  } catch (error) {
    console.error('Error deleting call:', error);
    return false;
  }
}

/**
 * Get storage statistics
 */
export async function getStorageStats(): Promise<{
  totalCalls: number;
  uploadedCalls: number;
  transcribedCalls: number;
  analyzedCalls: number;
  errorCalls: number;
  totalStorageBytes: number;
}> {
  const calls = await readCalls();

  const stats = {
    totalCalls: calls.length,
    uploadedCalls: calls.filter((c) => c.status === 'pending').length,
    transcribedCalls: calls.filter((c) => c.status === 'analyzing' || c.status === 'complete').length,
    analyzedCalls: calls.filter((c) => c.status === 'complete').length,
    errorCalls: calls.filter((c) => c.status === 'error').length,
    totalStorageBytes: 0,
  };

  // Calculate total storage size
  try {
    const transcriptFiles = await fs.readdir(TRANSCRIPTS_DIR);
    const analysisFiles = await fs.readdir(ANALYSES_DIR);
    const uploadFiles = await fs.readdir(UPLOADS_DIR);

    for (const file of transcriptFiles) {
      const stat = await fs.stat(path.join(TRANSCRIPTS_DIR, file));
      stats.totalStorageBytes += stat.size;
    }

    for (const file of analysisFiles) {
      const stat = await fs.stat(path.join(ANALYSES_DIR, file));
      stats.totalStorageBytes += stat.size;
    }

    for (const file of uploadFiles) {
      const stat = await fs.stat(path.join(UPLOADS_DIR, file));
      stats.totalStorageBytes += stat.size;
    }
  } catch (error) {
    console.error('Error calculating storage size:', error);
  }

  return stats;
}
