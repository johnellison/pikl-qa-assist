#!/usr/bin/env tsx

import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('🔍 Finding calls with 0 duration...\n');

  // Get all calls with 0 duration that have transcripts
  const calls = await prisma.call.findMany({
    where: {
      duration: 0,
      transcript: {
        isNot: null,
      },
    },
    include: {
      transcript: true,
    },
  });

  console.log(`Found ${calls.length} calls with 0 duration but have transcripts\n`);

  let fixed = 0;
  let errors = 0;

  for (const call of calls) {
    try {
      if (!call.transcript) continue;

      // Parse segments to get last timestamp
      const segments = JSON.parse(call.transcript.segments);

      if (segments.length === 0) {
        console.log(`⚠️  Call ${call.callId}: No segments found`);
        continue;
      }

      // Get last segment's timestamp + 5 second buffer
      const lastSegment = segments[segments.length - 1];
      const calculatedDuration = Math.ceil(lastSegment.timestamp + 5);

      console.log(`🔧 Fixing Call ${call.callId}: ${call.duration}s → ${calculatedDuration}s`);

      // Update both Call and Transcript tables
      await prisma.$transaction([
        prisma.call.update({
          where: { id: call.id },
          data: { duration: calculatedDuration },
        }),
        prisma.transcript.update({
          where: { callId: call.id },
          data: { duration: calculatedDuration },
        }),
      ]);

      fixed++;
    } catch (error) {
      console.error(`❌ Failed to fix call ${call.callId}:`, error);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log('='.repeat(60));
  console.log(`Total calls processed: ${calls.length}`);
  console.log(`✅ Successfully fixed: ${fixed}`);
  console.log(`❌ Errors: ${errors}`);
  console.log('='.repeat(60));
}

main().finally(() => prisma.$disconnect());
