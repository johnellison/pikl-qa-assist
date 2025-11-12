import fs from 'fs/promises';
import path from 'path';
import type {
  CallRecord,
  CallListResponse,
  StoredTranscript,
  StoredAnalysis,
  StorageStats,
  CallStatus,
} from '@/types/storage';
import type { Transcript, Analysis } from '@/types';

// Data directories
const DATA_DIR = path.join(process.cwd(), 'data');
const CALLS_FILE = path.join(DATA_DIR, 'calls', 'calls.json');
const TRANSCRIPTS_DIR = path.join(DATA_DIR, 'transcripts');
const ANALYSES_DIR = path.join(DATA_DIR, 'analyses');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

/**
 * Initialize storage directories
 */
export async function initStorage(): Promise<void> {
  const dirs = [
    path.join(DATA_DIR, 'calls'),
    TRANSCRIPTS_DIR,
    ANALYSES_DIR,
    UPLOADS_DIR,
  ];

  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }

  // Initialize calls.json if it doesn't exist
  try {
    await fs.access(CALLS_FILE);
  } catch {
    await fs.writeFile(CALLS_FILE, JSON.stringify([], null, 2));
  }
}

/**
 * Read all call records
 */
async function readCalls(): Promise<CallRecord[]> {
  try {
    const data = await fs.readFile(CALLS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading calls.json:', error);
    return [];
  }
}

/**
 * Write call records
 */
async function writeCalls(calls: CallRecord[]): Promise<void> {
  await fs.writeFile(CALLS_FILE, JSON.stringify(calls, null, 2));
}

/**
 * Create a new call record
 */
export async function createCallRecord(
  id: string,
  filename: string,
  filepath: string,
  metadata?: CallRecord['metadata']
): Promise<CallRecord> {
  await initStorage();

  const calls = await readCalls();

  const newCall: CallRecord = {
    id,
    filename,
    filepath,
    uploadedAt: new Date(),
    status: 'uploaded',
    metadata,
  };

  calls.push(newCall);
  await writeCalls(calls);

  return newCall;
}

/**
 * Get a call record by ID
 */
export async function getCallRecord(id: string): Promise<CallRecord | null> {
  const calls = await readCalls();
  return calls.find((call) => call.id === id) || null;
}

/**
 * Update a call record
 */
export async function updateCallRecord(
  id: string,
  updates: Partial<Omit<CallRecord, 'id' | 'uploadedAt'>>
): Promise<CallRecord | null> {
  const calls = await readCalls();
  const index = calls.findIndex((call) => call.id === id);

  if (index === -1) {
    return null;
  }

  calls[index] = {
    ...calls[index],
    ...updates,
  };

  await writeCalls(calls);
  return calls[index];
}

/**
 * Update call status
 */
export async function updateCallStatus(
  id: string,
  status: CallStatus,
  error?: string
): Promise<CallRecord | null> {
  return updateCallRecord(id, { status, error });
}

/**
 * List all call records with optional filtering
 */
export async function listCalls(
  filter?: {
    status?: CallStatus;
    limit?: number;
    offset?: number;
  }
): Promise<CallListResponse> {
  let calls = await readCalls();

  // Filter by status
  if (filter?.status) {
    calls = calls.filter((call) => call.status === filter.status);
  }

  const total = calls.length;

  // Apply pagination
  if (filter?.offset !== undefined) {
    calls = calls.slice(filter.offset);
  }
  if (filter?.limit !== undefined) {
    calls = calls.slice(0, filter.limit);
  }

  return { calls, total };
}

/**
 * Store a transcript
 */
export async function storeTranscript(
  callId: string,
  transcript: Transcript
): Promise<StoredTranscript> {
  await initStorage();

  const stored: StoredTranscript = {
    id: callId,
    callId,
    transcript,
    storedAt: new Date(),
  };

  const filepath = path.join(TRANSCRIPTS_DIR, `${callId}.json`);
  await fs.writeFile(filepath, JSON.stringify(stored, null, 2));

  // Update call record
  await updateCallRecord(callId, {
    transcriptId: callId,
    status: 'transcribed',
  });

  return stored;
}

/**
 * Get a stored transcript
 */
export async function getTranscript(callId: string): Promise<StoredTranscript | null> {
  try {
    const filepath = path.join(TRANSCRIPTS_DIR, `${callId}.json`);
    const data = await fs.readFile(filepath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

/**
 * Store an analysis
 */
export async function storeAnalysis(
  callId: string,
  analysis: Analysis
): Promise<StoredAnalysis> {
  await initStorage();

  const stored: StoredAnalysis = {
    id: callId,
    callId,
    analysis,
    storedAt: new Date(),
  };

  const filepath = path.join(ANALYSES_DIR, `${callId}.json`);
  await fs.writeFile(filepath, JSON.stringify(stored, null, 2));

  // Update call record
  await updateCallRecord(callId, {
    analysisId: callId,
    status: 'analyzed',
  });

  return stored;
}

/**
 * Get a stored analysis
 */
export async function getAnalysis(callId: string): Promise<StoredAnalysis | null> {
  try {
    const filepath = path.join(ANALYSES_DIR, `${callId}.json`);
    const data = await fs.readFile(filepath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

/**
 * Get complete call data (record + transcript + analysis)
 */
export async function getCompleteCallData(callId: string): Promise<{
  call: CallRecord | null;
  transcript: StoredTranscript | null;
  analysis: StoredAnalysis | null;
}> {
  const [call, transcript, analysis] = await Promise.all([
    getCallRecord(callId),
    getTranscript(callId),
    getAnalysis(callId),
  ]);

  return { call, transcript, analysis };
}

/**
 * Delete a call and all associated data
 */
export async function deleteCall(callId: string): Promise<boolean> {
  try {
    // Delete from calls.json
    const calls = await readCalls();
    const filtered = calls.filter((call) => call.id !== callId);
    await writeCalls(filtered);

    // Delete transcript file
    try {
      await fs.unlink(path.join(TRANSCRIPTS_DIR, `${callId}.json`));
    } catch {
      // File might not exist
    }

    // Delete analysis file
    try {
      await fs.unlink(path.join(ANALYSES_DIR, `${callId}.json`));
    } catch {
      // File might not exist
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
export async function getStorageStats(): Promise<StorageStats> {
  const calls = await readCalls();

  const stats: StorageStats = {
    totalCalls: calls.length,
    uploadedCalls: calls.filter((c) => c.status === 'uploaded').length,
    transcribedCalls: calls.filter((c) => c.status === 'transcribed').length,
    analyzedCalls: calls.filter((c) => c.status === 'analyzed').length,
    errorCalls: calls.filter((c) => c.status === 'error').length,
    totalStorageBytes: 0,
  };

  // Calculate total storage size
  try {
    const transcriptFiles = await fs.readdir(TRANSCRIPTS_DIR);
    const analysisFiles = await fs.readdir(ANALYSES_DIR);

    for (const file of transcriptFiles) {
      if (file.endsWith('.json')) {
        const stat = await fs.stat(path.join(TRANSCRIPTS_DIR, file));
        stats.totalStorageBytes += stat.size;
      }
    }

    for (const file of analysisFiles) {
      if (file.endsWith('.json')) {
        const stat = await fs.stat(path.join(ANALYSES_DIR, file));
        stats.totalStorageBytes += stat.size;
      }
    }
  } catch (error) {
    console.error('Error calculating storage size:', error);
  }

  return stats;
}

/**
 * Search calls by various criteria
 */
export async function searchCalls(query: {
  agentName?: string;
  agentId?: string;
  status?: CallStatus;
  dateFrom?: Date;
  dateTo?: Date;
}): Promise<CallRecord[]> {
  let calls = await readCalls();

  if (query.agentName) {
    calls = calls.filter((call) =>
      call.metadata?.agentName?.toLowerCase().includes(query.agentName!.toLowerCase())
    );
  }

  if (query.agentId) {
    calls = calls.filter((call) => call.metadata?.agentId === query.agentId);
  }

  if (query.status) {
    calls = calls.filter((call) => call.status === query.status);
  }

  if (query.dateFrom) {
    calls = calls.filter((call) => new Date(call.uploadedAt) >= query.dateFrom!);
  }

  if (query.dateTo) {
    calls = calls.filter((call) => new Date(call.uploadedAt) <= query.dateTo!);
  }

  return calls;
}

/**
 * Export call data as JSON
 */
export async function exportCallData(callId: string): Promise<string> {
  const { call, transcript, analysis } = await getCompleteCallData(callId);

  return JSON.stringify(
    {
      call,
      transcript,
      analysis,
      exportedAt: new Date(),
    },
    null,
    2
  );
}
