#!/usr/bin/env tsx

import { prisma } from '../src/lib/prisma';

async function main() {
  // Get recent calls with analyzing status
  const calls = await prisma.call.findMany({
    where: { status: 'analyzing' },
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      transcript: true,
    }
  });

  console.log('Calls with analyzing status:\n');
  calls.forEach(call => {
    console.log(`CallID: ${call.callId} | Duration: ${call.duration}s | Has Transcript DB: ${!!call.transcript}`);
    if (call.transcript) {
      console.log(`  Transcript Duration: ${call.transcript.duration}s`);
    }
  });

  // Check if there's a pattern
  const analyzingWithoutTranscript = await prisma.call.count({
    where: {
      status: 'analyzing',
      transcript: null,
    }
  });

  console.log(`\nTotal calls with status=analyzing: ${calls.length}`);
  console.log(`Calls stuck in analyzing (no transcript): ${analyzingWithoutTranscript}`);
}

main().finally(() => prisma.$disconnect());
