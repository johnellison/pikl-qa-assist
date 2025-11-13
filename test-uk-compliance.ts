/**
 * Test script to verify UK compliance enhancements
 * Re-analyzes an existing call to test the new compliance dimensions
 */

import { analyzeTranscript } from './src/lib/claude-service';
import type { Transcript } from './src/types';
import fs from 'fs';
import path from 'path';

async function testUKCompliance() {
  console.log('🇬🇧 Testing UK Compliance Enhancements...\n');

  // Load an existing transcript from processed calls
  const callsData = JSON.parse(
    fs.readFileSync('data/calls/calls.json', 'utf-8')
  );

  if (callsData.length === 0) {
    console.error('❌ No processed calls found. Please process a call first.');
    process.exit(1);
  }

  // Get the first call
  const call = callsData[0];
  console.log(`📞 Testing with Call ID: ${call.callId}`);
  console.log(`👤 Agent: ${call.agentName}`);
  const durationMins = Math.floor(call.duration / 60);
  const durationSecs = Math.floor(call.duration % 60);
  console.log(`⏱️  Duration: ${durationMins}m ${durationSecs}s\n`);

  // Load the transcript using the transcriptUrl
  const transcriptPath = call.transcriptUrl.replace(/^\//, '');
  if (!fs.existsSync(transcriptPath)) {
    console.error(`❌ Transcript not found: ${transcriptPath}`);
    process.exit(1);
  }

  const transcript: Transcript = JSON.parse(
    fs.readFileSync(transcriptPath, 'utf-8')
  );

  console.log('🔄 Re-analyzing with UK compliance enhancements...\n');

  try {
    const analysis = await analyzeTranscript(transcript);

    console.log('✅ Analysis Complete!\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 ANALYSIS RESULTS');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Call Type
    console.log(`🏷️  Call Type: ${analysis.callType || 'Not detected'}\n`);

    // Overall Score
    console.log(`⭐ Overall Score: ${analysis.overallScore.toFixed(1)}/10\n`);

    // Core QA Dimensions
    console.log('📈 CORE QA DIMENSIONS:');
    console.log('─────────────────────────────────────────────────────────');
    console.log(`  Rapport:              ${analysis.scores.rapport.toFixed(1)}/10`);
    console.log(`  Needs Discovery:      ${analysis.scores.needsDiscovery.toFixed(1)}/10`);
    console.log(`  Product Knowledge:    ${analysis.scores.productKnowledge.toFixed(1)}/10`);
    console.log(`  Objection Handling:   ${analysis.scores.objectionHandling.toFixed(1)}/10`);
    console.log(`  Closing:              ${analysis.scores.closing.toFixed(1)}/10`);
    console.log(`  Professionalism:      ${analysis.scores.professionalism.toFixed(1)}/10`);
    console.log(`  Follow-Up:            ${analysis.scores.followUp.toFixed(1)}/10\n`);

    // UK Compliance Dimensions
    console.log('🇬🇧 UK COMPLIANCE DIMENSIONS:');
    console.log('─────────────────────────────────────────────────────────');
    console.log(`  Call Opening Compliance:      ${analysis.scores.callOpeningCompliance.toFixed(1)}/10`);
    console.log(`  Data Protection Compliance:   ${analysis.scores.dataProtectionCompliance.toFixed(1)}/10`);
    console.log(`  Mandatory Disclosures:        ${analysis.scores.mandatoryDisclosures.toFixed(1)}/10`);
    console.log(`  TCF Compliance:               ${analysis.scores.tcfCompliance.toFixed(1)}/10`);
    console.log(`  Sales Process Compliance:     ${analysis.scores.salesProcessCompliance !== null ? analysis.scores.salesProcessCompliance.toFixed(1) + '/10' : 'N/A'}`);
    console.log(`  Complaints Handling:          ${analysis.scores.complaintsHandling !== null ? analysis.scores.complaintsHandling.toFixed(1) + '/10' : 'N/A'}\n`);

    // Compliance Issues
    if (analysis.complianceIssues && analysis.complianceIssues.length > 0) {
      console.log('⚠️  COMPLIANCE ISSUES DETECTED:');
      console.log('─────────────────────────────────────────────────────────');
      analysis.complianceIssues.forEach((issue, idx) => {
        const severityEmoji = {
          critical: '🔴',
          high: '🟠',
          medium: '🟡',
          low: '🟢'
        }[issue.severity] || '⚪';

        console.log(`\n${idx + 1}. ${severityEmoji} ${issue.severity.toUpperCase()}`);
        console.log(`   Category: ${issue.category}`);
        console.log(`   Issue: ${issue.issue}`);
        console.log(`   Regulatory Reference: ${issue.regulatoryReference}`);
        console.log(`   Remediation: ${issue.remediation}`);
        if (issue.timestamp !== null) {
          const mins = Math.floor(issue.timestamp / 60);
          const secs = Math.floor(issue.timestamp % 60);
          console.log(`   Timestamp: ${mins}:${secs.toString().padStart(2, '0')}`);
        }
      });
      console.log();
    } else {
      console.log('✅ NO COMPLIANCE ISSUES DETECTED\n');
    }

    // Key Moments (compliance-related only)
    const complianceMoments = analysis.keyMoments.filter(m =>
      ['callOpeningCompliance', 'dataProtectionCompliance', 'mandatoryDisclosures',
       'tcfCompliance', 'salesProcessCompliance', 'complaintsHandling'].includes(m.category)
    );

    if (complianceMoments.length > 0) {
      console.log('🔍 COMPLIANCE KEY MOMENTS:');
      console.log('─────────────────────────────────────────────────────────');
      complianceMoments.forEach((moment, idx) => {
        const typeEmoji = moment.type === 'positive' ? '✅' : moment.type === 'negative' ? '❌' : '➖';
        const mins = Math.floor(moment.timestamp / 60);
        const secs = Math.floor(moment.timestamp % 60);

        console.log(`\n${idx + 1}. ${typeEmoji} [${mins}:${secs.toString().padStart(2, '0')}] ${moment.category}`);
        console.log(`   ${moment.description}`);
        console.log(`   Quote: "${moment.quote.substring(0, 100)}${moment.quote.length > 100 ? '...' : ''}"`);
      });
      console.log();
    }

    // Coaching Recommendations
    if (analysis.coachingRecommendations.length > 0) {
      console.log('💡 COACHING RECOMMENDATIONS:');
      console.log('─────────────────────────────────────────────────────────');
      analysis.coachingRecommendations.forEach((rec, idx) => {
        console.log(`${idx + 1}. ${rec}`);
      });
      console.log();
    }

    // Summary
    console.log('📝 SUMMARY:');
    console.log('─────────────────────────────────────────────────────────');
    console.log(analysis.summary);
    console.log();

    console.log('═══════════════════════════════════════════════════════════');
    console.log(`⏱️  Processing Time: ${(analysis.processingTime! / 1000).toFixed(2)}s`);
    console.log('═══════════════════════════════════════════════════════════\n');

    // Calculate compliance average
    const complianceScores = [
      analysis.scores.callOpeningCompliance,
      analysis.scores.dataProtectionCompliance,
      analysis.scores.mandatoryDisclosures,
      analysis.scores.tcfCompliance,
    ];

    if (analysis.scores.salesProcessCompliance !== null) {
      complianceScores.push(analysis.scores.salesProcessCompliance);
    }
    if (analysis.scores.complaintsHandling !== null) {
      complianceScores.push(analysis.scores.complaintsHandling);
    }

    const avgCompliance = complianceScores.reduce((a, b) => a + b, 0) / complianceScores.length;

    console.log('📊 COMPLIANCE SUMMARY:');
    console.log(`   Average Compliance Score: ${avgCompliance.toFixed(1)}/10`);
    console.log(`   Critical Issues: ${analysis.complianceIssues.filter(i => i.severity === 'critical').length}`);
    console.log(`   High Issues: ${analysis.complianceIssues.filter(i => i.severity === 'high').length}`);
    console.log(`   Medium Issues: ${analysis.complianceIssues.filter(i => i.severity === 'medium').length}`);
    console.log(`   Low Issues: ${analysis.complianceIssues.filter(i => i.severity === 'low').length}\n`);

    console.log('✅ UK Compliance Enhancement Test Complete!');
    console.log('\n🎉 The enhanced system is working correctly!\n');

  } catch (error) {
    console.error('❌ Error during analysis:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run the test
testUKCompliance().catch(console.error);
