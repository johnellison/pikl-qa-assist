/**
 * Script to validate that analysis quotes actually exist in transcripts
 * Checks for hallucinated quotes that don't match the actual conversation
 */

import fs from 'fs/promises';
import path from 'path';

interface TranscriptTurn {
  speaker: string;
  text: string;
  timestamp: number;
  confidence: number;
}

interface Transcript {
  callId: string;
  turns: TranscriptTurn[];
}

interface KeyMoment {
  timestamp: number;
  type: string;
  category: string;
  description: string;
  quote: string;
}

interface Analysis {
  callId: string;
  keyMoments: KeyMoment[];
}

async function validateAnalysisQuotes(callId: string): Promise<void> {
  const analysisPath = path.join(process.cwd(), 'data', 'analyses', `${callId}.json`);
  const transcriptPath = path.join(process.cwd(), 'data', 'transcripts', `${callId}.json`);

  const analysisData = await fs.readFile(analysisPath, 'utf-8');
  const transcriptData = await fs.readFile(transcriptPath, 'utf-8');

  const analysis: Analysis = JSON.parse(analysisData);
  const transcript: Transcript = JSON.parse(transcriptData);

  console.log(`\n=== Validating Analysis for ${callId} ===\n`);

  for (const moment of analysis.keyMoments) {
    const { timestamp, quote, category } = moment;

    // Find turns within +/- 30 seconds of the timestamp
    const relevantTurns = transcript.turns.filter(
      (turn) => Math.abs(turn.timestamp - timestamp) <= 30
    );

    // Check if quote exists in any of the relevant turns (fuzzy match)
    const quoteWords = quote.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const minMatchWords = Math.max(3, Math.floor(quoteWords.length * 0.6)); // At least 60% of words should match

    let found = false;
    let bestMatch = { turn: null as TranscriptTurn | null, matchedWords: 0 };

    for (const turn of relevantTurns) {
      const turnWords = turn.text.toLowerCase().split(/\s+/);
      let matchedWords = 0;

      for (const word of quoteWords) {
        if (turnWords.some((tw) => tw.includes(word) || word.includes(tw))) {
          matchedWords++;
        }
      }

      if (matchedWords >= minMatchWords) {
        found = true;
        break;
      }

      if (matchedWords > bestMatch.matchedWords) {
        bestMatch = { turn, matchedWords };
      }
    }

    if (!found) {
      console.log(`⚠️  QUOTE MISMATCH at ${formatTimestamp(timestamp)} (${category})`);
      console.log(`   Quote: "${quote}"`);
      console.log(`   Best match (${bestMatch.matchedWords}/${quoteWords.length} words):`);
      if (bestMatch.turn) {
        console.log(`   ${formatTimestamp(bestMatch.turn.timestamp)}: ${bestMatch.turn.text}`);
      }
      console.log(`   Context:`);
      relevantTurns.slice(0, 3).forEach((turn) => {
        console.log(`   ${formatTimestamp(turn.timestamp)}: ${turn.text.substring(0, 100)}...`);
      });
      console.log('');
    } else {
      console.log(`✓ Verified quote at ${formatTimestamp(timestamp)} (${category})`);
    }
  }
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Run validation for all complete calls
async function main() {
  const callsPath = path.join(process.cwd(), 'data', 'calls', 'calls.json');
  const callsData = await fs.readFile(callsPath, 'utf-8');
  const calls = JSON.parse(callsData);

  const completeCalls = calls.filter((call: any) => call.status === 'complete');

  console.log(`Found ${completeCalls.length} complete calls to validate\n`);

  for (const call of completeCalls) {
    try {
      await validateAnalysisQuotes(call.id);
    } catch (error) {
      console.error(`Error validating ${call.id}:`, error);
    }
  }
}

main().catch(console.error);
