/**
 * Database Storage Layer using Prisma ORM
 * Replaces JSON file storage with SQLite database operations
 */

import { prisma } from './prisma';
import type { Call, Analysis } from '@/types';
import type { Transcript } from '@/types';
import path from 'path';
import fs from 'fs/promises';

const UPLOADS_DIR = path.join(process.cwd(), 'data', 'uploads');

/**
 * Ensure required directories exist
 */
export async function ensureDirectories() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

/**
 * Read all calls from database
 */
export async function readCalls(): Promise<Call[]> {
  try {
    const calls = await prisma.call.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        analysis: {
          include: {
            scores: true,
          },
        },
      },
    });

    // Transform Prisma results to Call type
    return calls.map((call) => ({
      id: call.id,
      filename: call.filename,
      agentName: call.agentName,
      agentId: call.agentId,
      phoneNumber: call.phoneNumber,
      callId: call.callId,
      timestamp: call.timestamp,
      duration: call.duration,
      status: call.status as Call['status'],
      transcriptUrl: call.transcriptUrl ?? undefined,
      analysisUrl: call.analysisUrl ?? undefined,
      overallScore: call.overallScore ?? undefined,
      qaScore: call.qaScore ?? undefined,
      complianceScore: call.complianceScore ?? undefined,
      callType: call.callType as Call['callType'],
      createdAt: call.createdAt,
      updatedAt: call.updatedAt,
      errorMessage: call.errorMessage ?? undefined,
    }));
  } catch (error) {
    console.error('[DB_STORAGE] Failed to read calls:', error);
    return [];
  }
}

/**
 * Add a new call record
 */
export async function addCall(call: Call): Promise<Call> {
  try {
    // Check if call already exists
    const existing = await prisma.call.findUnique({
      where: { callId: call.callId },
    });

    if (existing) {
      // Update existing call
      const updated = await prisma.call.update({
        where: { callId: call.callId },
        data: {
          filename: call.filename,
          agentName: call.agentName,
          agentId: call.agentId,
          phoneNumber: call.phoneNumber,
          timestamp: call.timestamp,
          duration: call.duration,
          status: call.status,
          transcriptUrl: call.transcriptUrl,
          analysisUrl: call.analysisUrl,
          overallScore: call.overallScore,
          qaScore: call.qaScore,
          complianceScore: call.complianceScore,
          callType: call.callType,
          errorMessage: call.errorMessage,
        },
      });
      return transformPrismaCall(updated);
    }

    // Create new call
    const created = await prisma.call.create({
      data: {
        id: call.id,
        filename: call.filename,
        agentName: call.agentName,
        agentId: call.agentId,
        phoneNumber: call.phoneNumber,
        callId: call.callId,
        timestamp: call.timestamp,
        duration: call.duration,
        status: call.status,
        transcriptUrl: call.transcriptUrl,
        analysisUrl: call.analysisUrl,
        overallScore: call.overallScore,
        qaScore: call.qaScore,
        complianceScore: call.complianceScore,
        callType: call.callType,
        createdAt: call.createdAt,
        errorMessage: call.errorMessage,
      },
    });

    return transformPrismaCall(created);
  } catch (error) {
    console.error('[DB_STORAGE] Failed to add call:', error);
    throw error;
  }
}

/**
 * Get call by ID
 */
export async function getCallById(id: string): Promise<Call | null> {
  try {
    const call = await prisma.call.findUnique({
      where: { id },
      include: {
        analysis: {
          include: {
            scores: true,
          },
        },
      },
    });

    if (!call) return null;

    return transformPrismaCall(call);
  } catch (error) {
    console.error('[DB_STORAGE] Failed to get call:', error);
    return null;
  }
}

/**
 * Update call record
 */
export async function updateCall(
  id: string,
  updates: Partial<Call>
): Promise<Call | null> {
  try {
    const updated = await prisma.call.update({
      where: { id },
      data: {
        filename: updates.filename,
        agentName: updates.agentName,
        agentId: updates.agentId,
        phoneNumber: updates.phoneNumber,
        timestamp: updates.timestamp,
        duration: updates.duration,
        status: updates.status,
        transcriptUrl: updates.transcriptUrl,
        analysisUrl: updates.analysisUrl,
        overallScore: updates.overallScore,
        qaScore: updates.qaScore,
        complianceScore: updates.complianceScore,
        callType: updates.callType,
        errorMessage: updates.errorMessage,
        updatedAt: new Date(),
      },
    });

    return transformPrismaCall(updated);
  } catch (error) {
    console.error('[DB_STORAGE] Failed to update call:', error);
    return null;
  }
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
 * Save transcript to database
 */
export async function saveTranscript(transcript: Transcript): Promise<void> {
  try {
    // Convert turns to plain text
    const text = transcript.turns.map((turn) => `${turn.speaker}: ${turn.text}`).join('\n');

    await prisma.transcript.upsert({
      where: { callId: transcript.callId },
      create: {
        callId: transcript.callId,
        text: text,
        segments: JSON.stringify(transcript.turns),
        duration: transcript.durationSeconds,
      },
      update: {
        text: text,
        segments: JSON.stringify(transcript.turns),
        duration: transcript.durationSeconds,
      },
    });
  } catch (error) {
    console.error('[DB_STORAGE] Failed to save transcript:', error);
    throw error;
  }
}

/**
 * Save transcript as plain text (for compatibility)
 */
export async function saveTranscriptAsText(
  callId: string,
  textContent: string
): Promise<void> {
  // This is now handled by saveTranscript, but kept for compatibility
  const transcript = await prisma.transcript.findUnique({
    where: { callId },
  });

  if (transcript) {
    await prisma.transcript.update({
      where: { callId },
      data: { text: textContent },
    });
  }
}

/**
 * Get transcript by call ID
 */
export async function getTranscript(callId: string): Promise<Transcript | null> {
  try {
    const transcript = await prisma.transcript.findUnique({
      where: { callId },
    });

    if (!transcript) return null;

    return {
      callId: transcript.callId,
      turns: JSON.parse(transcript.segments),
      durationSeconds: transcript.duration,
    };
  } catch (error) {
    console.error('[DB_STORAGE] Failed to get transcript:', error);
    return null;
  }
}

/**
 * Get transcript text by call ID
 */
export async function getTranscriptText(callId: string): Promise<string | null> {
  try {
    const transcript = await prisma.transcript.findUnique({
      where: { callId },
      select: { text: true },
    });

    return transcript?.text || null;
  } catch (error) {
    console.error('[DB_STORAGE] Failed to get transcript text:', error);
    return null;
  }
}

/**
 * Save analysis to database
 */
export async function saveAnalysis(analysis: Analysis): Promise<void> {
  try {
    // Delete existing analysis if present
    await prisma.analysis.deleteMany({
      where: { callId: analysis.callId },
    });

    // Create new analysis
    const createdAnalysis = await prisma.analysis.create({
      data: {
        callId: analysis.callId,
        callType: analysis.callType,
        overallScore: analysis.overallScore,
        qaScore: analysis.qaScore,
        complianceScore: analysis.complianceScore,
        summary: analysis.summary,
        callOutcome: analysis.callOutcome,
        processingTime: analysis.processingTime,
      },
    });

    // Save QA scores
    if (analysis.scores) {
      await prisma.qAScores.create({
        data: {
          analysisId: createdAnalysis.id,
          rapport: analysis.scores.rapport,
          needsDiscovery: analysis.scores.needsDiscovery,
          productKnowledge: analysis.scores.productKnowledge,
          objectionHandling: analysis.scores.objectionHandling,
          closing: analysis.scores.closing,
          professionalism: analysis.scores.professionalism,
          followUp: analysis.scores.followUp,
          callOpeningCompliance: analysis.scores.callOpeningCompliance,
          dataProtectionCompliance: analysis.scores.dataProtectionCompliance,
          mandatoryDisclosures: analysis.scores.mandatoryDisclosures,
          tcfCompliance: analysis.scores.tcfCompliance,
          salesProcessCompliance: analysis.scores.salesProcessCompliance,
          complaintsHandling: analysis.scores.complaintsHandling,
        },
      });
    }

    // Save key moments
    if (analysis.keyMoments?.length) {
      await prisma.keyMoment.createMany({
        data: analysis.keyMoments.map((km) => ({
          analysisId: createdAnalysis.id,
          timestamp: km.timestamp,
          type: km.type,
          category: km.category,
          description: km.description,
          quote: km.quote,
        })),
      });
    }

    // Save coaching recommendations
    if (analysis.coachingRecommendations?.length) {
      await prisma.coachingRecommendation.createMany({
        data: analysis.coachingRecommendations.map((rec) => ({
          analysisId: createdAnalysis.id,
          recommendation: rec,
        })),
      });
    }

    // Save compliance issues
    if (analysis.complianceIssues?.length) {
      await prisma.complianceIssue.createMany({
        data: analysis.complianceIssues.map((issue) => ({
          analysisId: createdAnalysis.id,
          severity: issue.severity,
          category: issue.category,
          issue: issue.issue,
          regulatoryReference: issue.regulatoryReference,
          timestamp: issue.timestamp,
          remediation: issue.remediation,
        })),
      });
    }

    // Save outcome metrics
    if (analysis.outcomeMetrics) {
      await prisma.outcomeMetrics.create({
        data: {
          analysisId: createdAnalysis.id,
          quotesCompleted: analysis.outcomeMetrics.quotesCompleted,
          salesCompleted: analysis.outcomeMetrics.salesCompleted,
          renewalsCompleted: analysis.outcomeMetrics.renewalsCompleted,
        },
      });
    }

    // Update call record with scores
    await prisma.call.update({
      where: { callId: analysis.callId },
      data: {
        overallScore: analysis.overallScore,
        qaScore: analysis.qaScore,
        complianceScore: analysis.complianceScore,
        callType: analysis.callType,
      },
    });
  } catch (error) {
    console.error('[DB_STORAGE] Failed to save analysis:', error);
    throw error;
  }
}

/**
 * Get analysis by call ID
 */
export async function getAnalysis(callId: string): Promise<Analysis | null> {
  try {
    const analysis = await prisma.analysis.findUnique({
      where: { callId },
      include: {
        scores: true,
        keyMoments: true,
        coachingRecommendations: true,
        complianceIssues: true,
        outcomeMetrics: true,
      },
    });

    if (!analysis) return null;

    return {
      callId: analysis.callId,
      callType: analysis.callType as Analysis['callType'],
      overallScore: analysis.overallScore,
      qaScore: analysis.qaScore ?? undefined,
      complianceScore: analysis.complianceScore ?? undefined,
      scores: analysis.scores
        ? {
            rapport: analysis.scores.rapport,
            needsDiscovery: analysis.scores.needsDiscovery,
            productKnowledge: analysis.scores.productKnowledge,
            objectionHandling: analysis.scores.objectionHandling,
            closing: analysis.scores.closing,
            professionalism: analysis.scores.professionalism,
            followUp: analysis.scores.followUp,
            callOpeningCompliance: analysis.scores.callOpeningCompliance,
            dataProtectionCompliance: analysis.scores.dataProtectionCompliance,
            mandatoryDisclosures: analysis.scores.mandatoryDisclosures,
            tcfCompliance: analysis.scores.tcfCompliance,
            salesProcessCompliance: analysis.scores.salesProcessCompliance ?? null,
            complaintsHandling: analysis.scores.complaintsHandling ?? null,
          }
        : ({} as Analysis['scores']),
      keyMoments: analysis.keyMoments.map((km) => ({
        timestamp: km.timestamp,
        type: km.type as 'positive' | 'negative' | 'neutral',
        category: km.category,
        description: km.description,
        quote: km.quote,
      })),
      coachingRecommendations: analysis.coachingRecommendations.map(
        (cr) => cr.recommendation
      ),
      summary: analysis.summary,
      callOutcome: analysis.callOutcome,
      outcomeMetrics: analysis.outcomeMetrics
        ? {
            quotesCompleted: analysis.outcomeMetrics.quotesCompleted,
            salesCompleted: analysis.outcomeMetrics.salesCompleted,
            renewalsCompleted: analysis.outcomeMetrics.renewalsCompleted,
          }
        : undefined,
      complianceIssues: analysis.complianceIssues.map((issue) => ({
        severity: issue.severity as 'critical' | 'high' | 'medium' | 'low',
        category: issue.category,
        issue: issue.issue,
        regulatoryReference: issue.regulatoryReference,
        timestamp: issue.timestamp ?? null,
        remediation: issue.remediation,
      })),
      processingTime: analysis.processingTime ?? undefined,
    };
  } catch (error) {
    console.error('[DB_STORAGE] Failed to get analysis:', error);
    return null;
  }
}

/**
 * Get complete call data (call + transcript + analysis)
 */
export async function getCompleteCallData(callId: string): Promise<{
  call: Call | null;
  transcript: Transcript | null;
  analysis: Analysis | null;
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
    // Get call first to find filename
    const call = await getCallById(callId);
    if (!call) return false;

    // Prisma will handle cascade deletes automatically
    await prisma.call.delete({
      where: { id: callId },
    });

    // Delete uploaded audio file if exists
    if (call.filename) {
      try {
        await fs.unlink(getUploadPath(call.filename));
      } catch {
        // Ignore file deletion errors
      }
    }

    return true;
  } catch (error) {
    console.error('[DB_STORAGE] Failed to delete call:', error);
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
  try {
    const calls = await prisma.call.findMany({
      select: { status: true },
    });

    const stats = {
      totalCalls: calls.length,
      uploadedCalls: calls.filter((c) => c.status === 'pending').length,
      transcribedCalls: calls.filter(
        (c) => c.status === 'analyzing' || c.status === 'complete'
      ).length,
      analyzedCalls: calls.filter((c) => c.status === 'complete').length,
      errorCalls: calls.filter((c) => c.status === 'error').length,
      totalStorageBytes: 0,
    };

    // Calculate approximate storage size (database + uploads)
    try {
      const dbPath = path.join(process.cwd(), 'data', 'db', 'qa-assist.db');
      const dbStat = await fs.stat(dbPath);
      stats.totalStorageBytes = dbStat.size;

      // Add uploads directory size
      const uploadFiles = await fs.readdir(UPLOADS_DIR);
      for (const file of uploadFiles) {
        const fileStat = await fs.stat(path.join(UPLOADS_DIR, file));
        stats.totalStorageBytes += fileStat.size;
      }
    } catch (error) {
      console.error('[DB_STORAGE] Error calculating storage size:', error);
    }

    return stats;
  } catch (error) {
    console.error('[DB_STORAGE] Failed to get storage stats:', error);
    return {
      totalCalls: 0,
      uploadedCalls: 0,
      transcribedCalls: 0,
      analyzedCalls: 0,
      errorCalls: 0,
      totalStorageBytes: 0,
    };
  }
}

/**
 * Helper function to transform Prisma Call to app Call type
 */
function transformPrismaCall(prismaCall: any): Call {
  return {
    id: prismaCall.id,
    filename: prismaCall.filename,
    agentName: prismaCall.agentName,
    agentId: prismaCall.agentId,
    phoneNumber: prismaCall.phoneNumber,
    callId: prismaCall.callId,
    timestamp: prismaCall.timestamp,
    duration: prismaCall.duration,
    status: prismaCall.status as Call['status'],
    transcriptUrl: prismaCall.transcriptUrl ?? undefined,
    analysisUrl: prismaCall.analysisUrl ?? undefined,
    overallScore: prismaCall.overallScore ?? undefined,
    qaScore: prismaCall.qaScore ?? undefined,
    complianceScore: prismaCall.complianceScore ?? undefined,
    callType: prismaCall.callType as Call['callType'],
    createdAt: prismaCall.createdAt,
    updatedAt: prismaCall.updatedAt,
    errorMessage: prismaCall.errorMessage ?? undefined,
  };
}

// For backwards compatibility, re-export writeCalls if needed
export async function writeCalls(calls: Call[]): Promise<void> {
  // This is no longer needed with database storage
  // but kept for compatibility during transition
  console.warn('[DB_STORAGE] writeCalls is deprecated with database storage');
}
