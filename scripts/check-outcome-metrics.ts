#!/usr/bin/env tsx

import { prisma } from '../src/lib/prisma';

async function main() {
  const analysis = await prisma.analysis.findFirst({
    include: { outcomeMetrics: true },
  });

  if (!analysis) {
    console.log('No analyses found');
    await prisma.$disconnect();
    return;
  }

  console.log('Analysis callId:', analysis.callId);
  console.log('Has outcomeMetrics:', !!analysis.outcomeMetrics);
  console.log('Outcome Metrics:', analysis.outcomeMetrics);

  // Count total outcome metrics
  const totalWithMetrics = await prisma.outcomeMetrics.count();
  const totalAnalyses = await prisma.analysis.count();

  console.log('\nTotal analyses:', totalAnalyses);
  console.log('Total with outcome metrics:', totalWithMetrics);

  await prisma.$disconnect();
}

main();
