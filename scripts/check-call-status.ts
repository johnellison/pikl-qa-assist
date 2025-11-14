#!/usr/bin/env tsx

import { prisma } from '../src/lib/prisma';

async function main() {
  // Check recent calls status
  const calls = await prisma.call.findMany({
    take: 15,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      callId: true,
      agentName: true,
      duration: true,
      status: true,
      errorMessage: true,
      createdAt: true,
    }
  });

  console.log('Recent 15 calls:\n');
  calls.forEach(call => {
    console.log(`CallID: ${call.callId} | Status: ${call.status} | Duration: ${call.duration}s | Agent: ${call.agentName}`);
    if (call.errorMessage) {
      console.log(`  Error: ${call.errorMessage}`);
    }
  });

  // Count by status
  const statusCounts = await prisma.call.groupBy({
    by: ['status'],
    _count: true,
  });

  console.log('\nStatus breakdown:');
  statusCounts.forEach(s => {
    console.log(`  ${s.status}: ${s._count}`);
  });
}

main().finally(() => prisma.$disconnect());
