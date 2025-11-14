#!/usr/bin/env tsx

/**
 * Migration script to transfer data from JSON files to SQLite database
 * Usage: npx tsx scripts/migrate-json-to-sqlite.ts
 */

import { prisma } from '../src/lib/prisma';
import { readCalls, getTranscript, getAnalysis } from '../src/lib/storage-json';
import type { Call } from '../src/types';

interface MigrationStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  totalTranscripts: number;
  successfulTranscripts: number;
  totalAnalyses: number;
  successfulAnalyses: number;
  errors: Array<{ type: string; callId: string; error: string }>;
}

async function migrateCall(call: Call, stats: MigrationStats): Promise<void> {
  try {
    // Check if call already exists
    const existingCall = await prisma.call.findUnique({
      where: { callId: call.callId },
    });

    if (existingCall) {
      console.log(`  ⚠️  Call ${call.callId} already exists, skipping call record...`);
    } else {
      // Insert call
      await prisma.call.create({
        data: {
          id: call.id,
          filename: call.filename,
          agentName: call.agentName,
          agentId: call.agentId,
          phoneNumber: call.phoneNumber,
          callId: call.callId,
          timestamp: new Date(call.timestamp),
          duration: call.duration,
          status: call.status,
          transcriptUrl: call.transcriptUrl,
          analysisUrl: call.analysisUrl,
          overallScore: call.overallScore,
          qaScore: call.qaScore,
          complianceScore: call.complianceScore,
          callType: call.callType,
          createdAt: new Date(call.createdAt),
          updatedAt: new Date(call.updatedAt),
          errorMessage: call.errorMessage,
        },
      });

      stats.successfulCalls++;
      console.log(`  ✅ Migrated call: ${call.callId}`);
    }
  } catch (error) {
    stats.failedCalls++;
    stats.errors.push({
      type: 'call',
      callId: call.callId,
      error: error instanceof Error ? error.message : String(error),
    });
    console.error(`  ❌ Failed to migrate call ${call.callId}:`, error);
  }
}

async function migrateTranscript(callId: string, stats: MigrationStats): Promise<void> {
  try {
    const transcript = await getTranscript(callId);
    if (!transcript) {
      return; // No transcript for this call
    }

    stats.totalTranscripts++;

    // Check if transcript already exists
    const existingTranscript = await prisma.transcript.findUnique({
      where: { callId: transcript.callId },
    });

    if (existingTranscript) {
      console.log(`    ⚠️  Transcript for ${callId} already exists, skipping...`);
      return;
    }

    // Convert transcript text  to plain text format
    const text = transcript.turns.map((turn) => `${turn.speaker}: ${turn.text}`).join('\n');

    // Insert transcript
    await prisma.transcript.create({
      data: {
        callId: transcript.callId,
        text: text,
        segments: JSON.stringify(transcript.turns),
        duration: transcript.durationSeconds,
      },
    });

    stats.successfulTranscripts++;
    console.log(`    ✅ Migrated transcript for: ${callId}`);
  } catch (error) {
    stats.errors.push({
      type: 'transcript',
      callId,
      error: error instanceof Error ? error.message : String(error),
    });
    console.error(`    ❌ Failed to migrate transcript for ${callId}:`, error);
  }
}

async function migrateAnalysis(callId: string, stats: MigrationStats): Promise<void> {
  try {
    const analysis = await getAnalysis(callId);
    if (!analysis) {
      return; // No analysis for this call
    }

    stats.totalAnalyses++;

    // Check if analysis already exists
    const existingAnalysis = await prisma.analysis.findUnique({
      where: { callId: analysis.callId },
    });

    if (existingAnalysis) {
      console.log(`    ⚠️  Analysis for ${callId} already exists, skipping...`);
      return;
    }

    // Insert analysis
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

    // Insert QA scores
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

    // Insert key moments
    if (analysis.keyMoments && analysis.keyMoments.length > 0) {
      await prisma.keyMoment.createMany({
        data: analysis.keyMoments.map((km: any) => ({
          analysisId: createdAnalysis.id,
          timestamp: km.timestamp,
          type: km.type,
          category: km.category,
          description: km.description,
          quote: km.quote,
        })),
      });
    }

    // Insert coaching recommendations
    if (analysis.coachingRecommendations && analysis.coachingRecommendations.length > 0) {
      await prisma.coachingRecommendation.createMany({
        data: analysis.coachingRecommendations.map((rec: any) => ({
          analysisId: createdAnalysis.id,
          recommendation: rec,
        })),
      });
    }

    // Insert compliance issues
    if (analysis.complianceIssues && analysis.complianceIssues.length > 0) {
      await prisma.complianceIssue.createMany({
        data: analysis.complianceIssues.map((issue: any) => ({
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

    // Insert outcome metrics
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

    stats.successfulAnalyses++;
    console.log(`    ✅ Migrated analysis for: ${callId}`);
  } catch (error) {
    stats.errors.push({
      type: 'analysis',
      callId,
      error: error instanceof Error ? error.message : String(error),
    });
    console.error(`    ❌ Failed to migrate analysis for ${callId}:`, error);
  }
}

async function main() {
  console.log('🚀 Starting migration from JSON to SQLite...\n');

  const stats: MigrationStats = {
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    totalTranscripts: 0,
    successfulTranscripts: 0,
    totalAnalyses: 0,
    successfulAnalyses: 0,
    errors: [],
  };

  try {
    // Read all calls from JSON
    console.log('📖 Reading calls from JSON storage...');
    const calls = await readCalls();
    stats.totalCalls = calls.length;
    console.log(`   Found ${calls.length} calls\n`);

    if (calls.length === 0) {
      console.log('ℹ️  No calls found in JSON storage. Migration complete.\n');
      return;
    }

    // Migrate each call
    for (const call of calls) {
      console.log(`\n📝 Migrating call ${call.callId}...`);

      // Migrate call record
      await migrateCall(call, stats);

      // Migrate transcript if exists
      if (call.transcriptUrl) {
        await migrateTranscript(call.id, stats);
      }

      // Migrate analysis if exists
      if (call.analysisUrl) {
        await migrateAnalysis(call.id, stats);
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log('='.repeat(60));
    console.log(`Calls:        ${stats.successfulCalls}/${stats.totalCalls} migrated (${stats.failedCalls} failed)`);
    console.log(`Transcripts:  ${stats.successfulTranscripts}/${stats.totalTranscripts} migrated`);
    console.log(`Analyses:     ${stats.successfulAnalyses}/${stats.totalAnalyses} migrated`);
    console.log('='.repeat(60));

    if (stats.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      stats.errors.forEach((err, idx) => {
        console.log(`  ${idx + 1}. [${err.type}] ${err.callId}: ${err.error}`);
      });
    }

    console.log('\n✨ Migration complete!\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
