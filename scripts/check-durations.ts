#!/usr/bin/env tsx

import { prisma } from '../src/lib/prisma';

async function main() {
  // Check recent calls
  const calls = await prisma.call.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      callId: true,
      agentName: true,
      duration: true,
      createdAt: true,
      transcript: {
        select: {
          duration: true
        }
      }
    }
  });

  console.log('Recent 10 calls:\n');
  calls.forEach(call => {
    console.log(`CallID: ${call.callId}`);
    console.log(`  Call.duration: ${call.duration} seconds`);
    console.log(`  Transcript.duration: ${call.transcript?.duration || 'N/A'} seconds`);
    console.log(`  Created: ${call.createdAt}`);
    console.log('');
  });
}

main().finally(() => prisma.$disconnect());
