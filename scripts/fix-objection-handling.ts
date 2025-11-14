/**
 * Migration Script: Fix Objection Handling Scores
 *
 * This script:
 * 1. Reads all analysis JSON files from data/analyses/
 * 2. For each analysis with objectionHandling: 0:
 *    - Checks if there are any objection-related key moments
 *    - If NO objection moments found, updates objectionHandling: 0 → objectionHandling: 8
 * 3. Recalculates scores:
 *    - QA Score (average of 7 dimensions)
 *    - Compliance Score (existing calculation)
 *    - Overall Score (70% QA + 30% Compliance)
 * 4. Updates analysis JSON file with new scores
 * 5. Updates corresponding entry in data/calls/calls.json with new scores
 * 6. Generates report showing which calls were updated
 */

import * as fs from 'fs/promises';
import * as path from 'path';

const ANALYSES_DIR = path.join(process.cwd(), 'data', 'analyses');
const CALLS_FILE = path.join(process.cwd(), 'data', 'calls', 'calls.json');

interface UpdateReport {
  callId: string;
  filename?: string;
  oldObjectionScore: number;
  newObjectionScore: number;
  oldOverallScore: number;
  newOverallScore: number;
  qaScore: number;
  complianceScore: number;
  hadObjectionMoments: boolean;
}

async function main() {
  console.log('🔧 Starting objection handling score migration...\n');

  // Read all analysis files
  const analysisFiles = await fs.readdir(ANALYSES_DIR);
  const jsonFiles = analysisFiles.filter(f => f.endsWith('.json'));

  console.log(`Found ${jsonFiles.length} analysis files to process\n`);

  const updates: UpdateReport[] = [];
  let processedCount = 0;
  let skippedCount = 0;

  // Process each analysis file
  for (const file of jsonFiles) {
    const filePath = path.join(ANALYSES_DIR, file);
    const analysisData = await fs.readFile(filePath, 'utf-8');
    const analysis = JSON.parse(analysisData);

    processedCount++;

    // Check if objectionHandling is 0
    if (analysis.scores?.objectionHandling !== 0) {
      skippedCount++;
      continue;
    }

    // Check if there are objection-related key moments
    const hasObjectionMoments = analysis.keyMoments?.some(
      (moment: any) =>
        moment.category === 'objectionHandling' ||
        moment.description?.toLowerCase().includes('objection')
    ) || false;

    // If no objection moments, update score to 8
    if (!hasObjectionMoments) {
      const oldObjectionScore = analysis.scores.objectionHandling;
      const oldOverallScore = analysis.overallScore;

      // Update objection handling score
      analysis.scores.objectionHandling = 8;

      // Recalculate QA score (7 core dimensions)
      const qaScores = [
        analysis.scores.rapport,
        analysis.scores.needsDiscovery,
        analysis.scores.productKnowledge,
        analysis.scores.objectionHandling, // Now 8
        analysis.scores.closing,
        analysis.scores.professionalism,
        analysis.scores.followUp,
      ].filter((score: any) => typeof score === 'number');

      const qaScore = qaScores.reduce((a: number, b: number) => a + b, 0) / qaScores.length;

      // Recalculate compliance score
      const complianceScores = [
        analysis.scores.callOpeningCompliance,
        analysis.scores.dataProtectionCompliance,
        analysis.scores.mandatoryDisclosures,
        analysis.scores.tcfCompliance,
      ].filter((score: any) => typeof score === 'number');

      if (typeof analysis.scores.salesProcessCompliance === 'number') {
        complianceScores.push(analysis.scores.salesProcessCompliance);
      }
      if (typeof analysis.scores.complaintsHandling === 'number') {
        complianceScores.push(analysis.scores.complaintsHandling);
      }

      const complianceScore = complianceScores.length > 0
        ? complianceScores.reduce((a: number, b: number) => a + b, 0) / complianceScores.length
        : 0;

      // Calculate weighted overall score (70% QA + 30% Compliance)
      // If complianceScore is 0 (no compliance scores), fall back to QA score only
      const newOverallScore = complianceScore > 0
        ? (qaScore * 0.7) + (complianceScore * 0.3)
        : qaScore;

      // Update analysis with new scores
      analysis.qaScore = qaScore;
      analysis.complianceScore = complianceScore;
      analysis.overallScore = newOverallScore;

      // Save updated analysis
      await fs.writeFile(filePath, JSON.stringify(analysis, null, 2), 'utf-8');

      // Add to update report
      updates.push({
        callId: analysis.callId,
        oldObjectionScore,
        newObjectionScore: 8,
        oldOverallScore,
        newOverallScore,
        qaScore,
        complianceScore,
        hadObjectionMoments: false,
      });

      console.log(`✅ Updated ${analysis.callId}: objection ${oldObjectionScore}→8, overall ${oldOverallScore.toFixed(2)}→${newOverallScore.toFixed(2)}`);
    } else {
      console.log(`⏭️  Skipped ${analysis.callId}: Has objection-related key moments`);
      skippedCount++;
    }
  }

  console.log(`\n📊 Migration Summary:`);
  console.log(`   Total files processed: ${processedCount}`);
  console.log(`   Files updated: ${updates.length}`);
  console.log(`   Files skipped: ${skippedCount}`);

  // Update calls.json with new scores
  if (updates.length > 0) {
    console.log(`\n🔄 Updating calls.json...`);
    const callsData = await fs.readFile(CALLS_FILE, 'utf-8');
    const calls = JSON.parse(callsData);

    // Create a map of callId to update info
    const updateMap = new Map(updates.map(u => [u.callId, u]));

    // Update each call with new scores
    for (const call of calls) {
      const update = updateMap.get(call.id);
      if (update) {
        call.overallScore = update.newOverallScore;
        call.qaScore = update.qaScore;
        call.complianceScore = update.complianceScore;
        update.filename = call.filename; // Add filename to report
      }
    }

    // Save updated calls.json
    await fs.writeFile(CALLS_FILE, JSON.stringify(calls, null, 2), 'utf-8');
    console.log(`✅ Updated ${updates.length} calls in calls.json`);
  }

  // Generate detailed report
  if (updates.length > 0) {
    const reportPath = path.join(process.cwd(), 'data', 'migration-report.json');
    await fs.writeFile(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        totalProcessed: processedCount,
        updated: updates.length,
        skipped: skippedCount,
      },
      updates,
    }, null, 2), 'utf-8');
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }

  console.log(`\n✨ Migration complete!\n`);

  // Print summary table
  if (updates.length > 0) {
    console.log(`\nUpdated Calls:`);
    console.log(`${'='.repeat(120)}`);
    console.log(`${'Call ID'.padEnd(30)} ${'Filename'.padEnd(50)} ${'Old→New Overall'.padEnd(20)} ${'QA Score'.padEnd(10)}`);
    console.log(`${'-'.repeat(120)}`);
    updates.slice(0, 10).forEach(u => {
      const filename = u.filename || 'N/A';
      const overallChange = `${u.oldOverallScore.toFixed(1)}→${u.newOverallScore.toFixed(1)}`;
      console.log(`${u.callId.padEnd(30)} ${filename.substring(0, 48).padEnd(50)} ${overallChange.padEnd(20)} ${u.qaScore.toFixed(1).padEnd(10)}`);
    });
    if (updates.length > 10) {
      console.log(`... and ${updates.length - 10} more (see migration-report.json for full list)`);
    }
    console.log(`${'-'.repeat(120)}\n`);
  }
}

main().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
