/**
 * Re-analyze all complete calls with improved prompt and validation
 */

import fs from 'fs/promises';
import path from 'path';

async function reanalyzeCalls() {
  const callsPath = path.join(process.cwd(), 'data', 'calls', 'calls.json');
  const callsData = await fs.readFile(callsPath, 'utf-8');
  const calls = JSON.parse(callsData);

  const completeCalls = calls.filter((call: any) => call.status === 'complete');

  console.log(`Found ${completeCalls.length} complete calls to re-analyze\n`);

  for (const call of completeCalls) {
    console.log(`Re-analyzing ${call.id} (${call.agentName})...`);

    try {
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId: call.id }),
      });

      if (!response.ok) {
        console.error(`  ❌ Failed: ${response.statusText}`);
        continue;
      }

      const result = await response.json();
      console.log(`  ✓ Completed (score: ${result.overallScore}/10)`);
    } catch (error) {
      console.error(`  ❌ Error:`, error);
    }

    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n✓ Re-analysis complete!');
}

reanalyzeCalls().catch(console.error);
