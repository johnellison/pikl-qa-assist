#!/usr/bin/env tsx

import { readCalls } from '../src/lib/storage-json';

async function main() {
  const calls = await readCalls();

  console.log('Total calls in JSON:', calls.length);

  const withTranscripts = calls.filter(c => c.transcriptUrl);
  const withAnalyses = calls.filter(c => c.analysisUrl);
  const complete = calls.filter(c => c.status === 'complete');

  console.log('Calls with transcriptUrl:', withTranscripts.length);
  console.log('Calls with analysisUrl:', withAnalyses.length);
  console.log('Complete calls:', complete.length);

  if (calls.length > 0) {
    const sample = calls[0];
    console.log('\nSample call:');
    console.log('- ID:', sample.id);
    console.log('- CallID:', sample.callId);
    console.log('- Status:', sample.status);
    console.log('- TranscriptURL:', sample.transcriptUrl);
    console.log('- AnalysisURL:', sample.analysisUrl);
  }
}

main();
