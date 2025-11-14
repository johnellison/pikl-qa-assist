#!/usr/bin/env tsx

import { prisma } from '../src/lib/prisma';

async function main() {
  // Get a recent transcript with 0 duration
  const call = await prisma.call.findFirst({
    where: {
      status: 'analyzing',
      duration: 0,
    },
    include: {
      transcript: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!call || !call.transcript) {
    console.log('No transcript found with 0 duration');
    return;
  }

  console.log(`Call ${call.callId}:`);
  console.log(`  Duration in Call table: ${call.duration}s`);
  console.log(`  Duration in Transcript table: ${call.transcript.duration}s`);
  console.log(`  Segments length: ${call.transcript.segments.length} chars`);

  // Parse segments to see structure
  try {
    const segments = JSON.parse(call.transcript.segments);
    console.log(`\n  Parsed segments count: ${segments.length}`);

    if (segments.length > 0) {
      console.log(`\n  First segment sample:`);
      console.log(JSON.stringify(segments[0], null, 2));

      // Check if segments have timestamp info
      const hasTimestamps = segments.some((s: any) => s.timestamp !== undefined || s.start !== undefined);
      console.log(`\n  Has timestamps: ${hasTimestamps}`);

      // Try to calculate duration from last segment
      if (segments.length > 0) {
        const lastSegment = segments[segments.length - 1];
        console.log(`\n  Last segment:`);
        console.log(JSON.stringify(lastSegment, null, 2));
      }
    }
  } catch (e) {
    console.log('  Failed to parse segments:', e);
  }
}

main().finally(() => prisma.$disconnect());
