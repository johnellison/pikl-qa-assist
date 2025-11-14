#!/usr/bin/env tsx

import { prisma } from '../src/lib/prisma';

async function main() {
  // Check a few sample call IDs from the 404 errors
  const testIds = [
    'call_1763068848609_chihf04',
    'call_1763068852517_8c81al8',
    'call_1763068846379_jdz6ax6',
  ];

  console.log('Testing call lookups:\n');

  for (const id of testIds) {
    const call = await prisma.call.findUnique({
      where: { id },
    });

    console.log(`ID: ${id}`);
    console.log(`Found: ${!!call}`);
    if (call) {
      console.log(`  - Agent: ${call.agentName}`);
      console.log(`  - Status: ${call.status}`);
    }
    console.log('');
  }

  // Show first 5 actual IDs in database
  console.log('\nFirst 5 calls in database:');
  const calls = await prisma.call.findMany({
    take: 5,
    select: { id: true, callId: true, agentName: true, status: true },
  });

  calls.forEach(call => {
    console.log(`  - ID: ${call.id}, CallID: ${call.callId}, Agent: ${call.agentName}, Status: ${call.status}`);
  });

  await prisma.$disconnect();
}

main();
