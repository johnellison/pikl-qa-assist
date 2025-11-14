#!/usr/bin/env tsx

import { prisma } from '../src/lib/prisma';
import * as fs from 'fs/promises';
import * as path from 'path';

async function main() {
  // Get recent calls with analyzing status
  const calls = await prisma.call.findMany({
    where: { status: 'analyzing' },
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      callId: true,
      filename: true,
      duration: true,
    }
  });

  console.log('Checking transcript files for recent calls:\n');

  for (const call of calls) {
    console.log(`\n--- Call ${call.callId} ---`);
    console.log(`ID: ${call.id}`);
    console.log(`Filename: ${call.filename}`);
    console.log(`DB Duration: ${call.duration}s`);

    const transcriptPath = path.join(process.cwd(), 'data', 'transcripts', `${call.id}.json`);

    try {
      const transcriptData = await fs.readFile(transcriptPath, 'utf-8');
      const transcript = JSON.parse(transcriptData);
      console.log(`Transcript exists: YES`);
      console.log(`Transcript durationSeconds: ${transcript.durationSeconds}`);
      console.log(`Transcript turns count: ${transcript.turns?.length || 0}`);
    } catch (err) {
      console.log(`Transcript exists: NO`);
    }
  }
}

main().finally(() => prisma.$disconnect());
