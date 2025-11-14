#!/usr/bin/env tsx

import { prisma } from '../src/lib/prisma';

async function main() {
  const callCount = await prisma.call.count();
  const transcriptCount = await prisma.transcript.count();
  const analysisCount = await prisma.analysis.count();
  const outcomeMetricsCount = await prisma.outcomeMetrics.count();

  console.log('Database Summary:');
  console.log('- Calls:', callCount);
  console.log('- Transcripts:', transcriptCount);
  console.log('- Analyses:', analysisCount);
  console.log('- Outcome Metrics:', outcomeMetricsCount);

  if (callCount > 0) {
    const sampleCall = await prisma.call.findFirst();
    console.log('\nSample Call:');
    console.log('- ID:', sampleCall?.id);
    console.log('- Agent:', sampleCall?.agentName);
    console.log('- Status:', sampleCall?.status);
  }

  await prisma.$disconnect();
}

main();
