/**
 * Example: Full QA Analysis Pipeline
 *
 * This example demonstrates the complete workflow:
 * 1. Upload audio file
 * 2. Transcribe using Whisper
 * 3. Analyze using Claude
 * 4. Display results
 *
 * Usage:
 *   npx tsx examples/analyze-call.ts path/to/audio.wav
 */

import { transcribeAudio } from '../src/lib/whisper-service';
import { analyzeTranscript, estimateAnalysisCost, formatAnalysisAsText } from '../src/lib/claude-service';
import { formatTranscriptAsText } from '../src/lib/whisper-service';
import * as fs from 'fs/promises';
import * as path from 'path';

async function main() {
  const audioFilePath = process.argv[2];

  if (!audioFilePath) {
    console.error('Usage: npx tsx examples/analyze-call.ts <audio-file-path>');
    process.exit(1);
  }

  // Validate file exists
  try {
    await fs.access(audioFilePath);
  } catch {
    console.error(`Error: File not found: ${audioFilePath}`);
    process.exit(1);
  }

  console.log('='.repeat(80));
  console.log('PIKL QA ASSISTANT - FULL ANALYSIS PIPELINE');
  console.log('='.repeat(80));
  console.log('');

  // Generate call ID from filename
  const callId = path.basename(audioFilePath, path.extname(audioFilePath));
  console.log(`Call ID: ${callId}`);
  console.log(`Audio File: ${audioFilePath}`);
  console.log('');

  // Step 1: Transcribe audio
  console.log('STEP 1: Transcribing audio with OpenAI Whisper...');
  console.log('-'.repeat(80));

  const transcribeStart = Date.now();
  const transcript = await transcribeAudio(audioFilePath, callId);
  const transcribeTime = Date.now() - transcribeStart;

  console.log(`✓ Transcription complete (${(transcribeTime / 1000).toFixed(1)}s)`);
  console.log(`  Duration: ${Math.floor(transcript.durationSeconds / 60)}m ${Math.floor(transcript.durationSeconds % 60)}s`);
  console.log(`  Language: ${transcript.language}`);
  console.log(`  Turns: ${transcript.turns.length}`);
  console.log('');

  // Step 2: Estimate analysis cost
  console.log('STEP 2: Estimating analysis cost...');
  console.log('-'.repeat(80));

  const estimatedCost = estimateAnalysisCost(transcript);
  console.log(`✓ Estimated cost: $${estimatedCost.toFixed(4)}`);
  console.log('');

  // Step 3: Analyze with Claude
  console.log('STEP 3: Analyzing transcript with Claude Sonnet 4.5...');
  console.log('-'.repeat(80));

  const analyzeStart = Date.now();
  const analysis = await analyzeTranscript(transcript);
  const analyzeTime = Date.now() - analyzeStart;

  console.log(`✓ Analysis complete (${(analyzeTime / 1000).toFixed(1)}s)`);
  console.log('');

  // Step 4: Display results
  console.log('STEP 4: Results');
  console.log('='.repeat(80));
  console.log('');

  // Overall score
  console.log(`Overall Score: ${analysis.overallScore.toFixed(1)}/10`);
  console.log('');

  // Dimensional scores
  console.log('Dimensional Scores:');
  console.log('-'.repeat(80));
  const dimensionLabels = {
    rapport: 'Rapport Building',
    needsDiscovery: 'Needs Discovery',
    productKnowledge: 'Product Knowledge',
    objectionHandling: 'Objection Handling',
    closing: 'Closing Techniques',
    compliance: 'Compliance',
    professionalism: 'Professionalism',
    followUp: 'Follow-Up',
  };

  Object.entries(analysis.scores).forEach(([key, score]) => {
    const label = dimensionLabels[key as keyof typeof dimensionLabels];
    const bar = '█'.repeat(Math.round(score));
    console.log(`${label.padEnd(25)} ${score.toFixed(1)}/10 ${bar}`);
  });
  console.log('');

  // Call outcome
  console.log(`Call Outcome: ${analysis.callOutcome}`);
  console.log('');

  // Summary
  console.log('Summary:');
  console.log('-'.repeat(80));
  console.log(analysis.summary);
  console.log('');

  // Key moments
  if (analysis.keyMoments.length > 0) {
    console.log('Key Moments:');
    console.log('-'.repeat(80));
    analysis.keyMoments.forEach((moment, idx) => {
      const timestamp = formatTimestamp(moment.timestamp);
      const typeEmoji = moment.type === 'positive' ? '✅' : moment.type === 'negative' ? '❌' : '➖';
      console.log(`${idx + 1}. [${timestamp}] ${typeEmoji} ${moment.category.toUpperCase()}`);
      console.log(`   ${moment.description}`);
      console.log(`   "${moment.quote}"`);
      console.log('');
    });
  }

  // Coaching recommendations
  if (analysis.coachingRecommendations.length > 0) {
    console.log('Coaching Recommendations:');
    console.log('-'.repeat(80));
    analysis.coachingRecommendations.forEach((rec, idx) => {
      console.log(`${idx + 1}. ${rec}`);
    });
    console.log('');
  }

  // Compliance issues
  if (analysis.complianceIssues && analysis.complianceIssues.length > 0) {
    console.log('⚠️  Compliance Issues:');
    console.log('-'.repeat(80));
    analysis.complianceIssues.forEach((issue, idx) => {
      console.log(`${idx + 1}. ${issue}`);
    });
    console.log('');
  }

  // Performance metrics
  console.log('Performance Metrics:');
  console.log('-'.repeat(80));
  console.log(`Transcription Time: ${(transcribeTime / 1000).toFixed(1)}s`);
  console.log(`Analysis Time: ${(analyzeTime / 1000).toFixed(1)}s`);
  console.log(`Total Time: ${((transcribeTime + analyzeTime) / 1000).toFixed(1)}s`);
  console.log(`Estimated Cost: $${estimatedCost.toFixed(4)}`);
  console.log('');

  // Step 5: Save results (optional)
  console.log('STEP 5: Saving results...');
  console.log('-'.repeat(80));

  const outputDir = path.join(process.cwd(), 'output');
  await fs.mkdir(outputDir, { recursive: true });

  // Save transcript
  const transcriptPath = path.join(outputDir, `${callId}-transcript.txt`);
  await fs.writeFile(transcriptPath, formatTranscriptAsText(transcript));
  console.log(`✓ Transcript saved: ${transcriptPath}`);

  // Save analysis
  const analysisPath = path.join(outputDir, `${callId}-analysis.txt`);
  await fs.writeFile(analysisPath, formatAnalysisAsText(analysis));
  console.log(`✓ Analysis saved: ${analysisPath}`);

  // Save JSON
  const jsonPath = path.join(outputDir, `${callId}-results.json`);
  await fs.writeFile(jsonPath, JSON.stringify({ transcript, analysis }, null, 2));
  console.log(`✓ JSON saved: ${jsonPath}`);
  console.log('');

  console.log('='.repeat(80));
  console.log('✓ ANALYSIS COMPLETE');
  console.log('='.repeat(80));
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Run the example
main().catch((error) => {
  console.error('');
  console.error('='.repeat(80));
  console.error('ERROR');
  console.error('='.repeat(80));
  console.error(error);
  process.exit(1);
});
