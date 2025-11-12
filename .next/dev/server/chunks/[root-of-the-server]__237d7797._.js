module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/claude-service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "analyzeTranscript",
    ()=>analyzeTranscript,
    "estimateAnalysisCost",
    ()=>estimateAnalysisCost,
    "formatAnalysisAsText",
    ()=>formatAnalysisAsText
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@anthropic-ai/sdk/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__Anthropic__as__default$3e$__ = __turbopack_context__.i("[project]/node_modules/@anthropic-ai/sdk/client.mjs [app-route] (ecmascript) <export Anthropic as default>");
;
const anthropic = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__Anthropic__as__default$3e$__["default"]({
    apiKey: process.env.ANTHROPIC_API_KEY
});
// Claude Sonnet 4.5 model
const MODEL = 'claude-sonnet-4-5-20250929';
async function analyzeTranscript(transcript) {
    const startTime = Date.now();
    try {
        // Format transcript for Claude
        const formattedTranscript = formatTranscriptForAnalysis(transcript);
        // Create the analysis prompt
        const prompt = createAnalysisPrompt(formattedTranscript);
        // Call Claude API
        const response = await anthropic.messages.create({
            model: MODEL,
            max_tokens: 4096,
            temperature: 0.3,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        });
        // Parse Claude's response
        const analysisText = response.content[0].type === 'text' ? response.content[0].text : '';
        const parsedAnalysis = parseClaudeResponse(analysisText);
        const processingTime = Date.now() - startTime;
        // Construct final analysis object
        // Validate quotes against transcript before returning
        const validatedKeyMoments = validateQuotes(parsedAnalysis.keyMoments, transcript);
        const analysis = {
            callId: transcript.callId,
            overallScore: parsedAnalysis.overallScore,
            scores: parsedAnalysis.scores,
            keyMoments: validatedKeyMoments,
            coachingRecommendations: parsedAnalysis.coachingRecommendations,
            summary: parsedAnalysis.summary,
            callOutcome: parsedAnalysis.callOutcome,
            complianceIssues: parsedAnalysis.complianceIssues,
            processingTime
        };
        return analysis;
    } catch (error) {
        console.error('Claude analysis error:', error);
        throw new Error(`Failed to analyze transcript: ${error.message}`);
    }
}
/**
 * Format transcript into a readable format for Claude
 */ function formatTranscriptForAnalysis(transcript) {
    const lines = [];
    lines.push(`Call Duration: ${Math.floor(transcript.durationSeconds / 60)}m ${Math.floor(transcript.durationSeconds % 60)}s`);
    lines.push(`Language: ${transcript.language || 'Unknown'}`);
    lines.push('');
    lines.push('TRANSCRIPT:');
    lines.push('---');
    lines.push('');
    transcript.turns.forEach((turn)=>{
        const timestamp = formatTimestamp(turn.timestamp);
        const speaker = turn.speaker === 'agent' ? 'AGENT' : 'CUSTOMER';
        lines.push(`[${timestamp}] ${speaker}: ${turn.text}`);
    });
    return lines.join('\n');
}
/**
 * Format timestamp as MM:SS
 */ function formatTimestamp(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
/**
 * Create comprehensive analysis prompt for Claude
 */ function createAnalysisPrompt(formattedTranscript) {
    return `You are an expert Quality Assurance analyst for customer service and sales calls. Analyze the following call transcript and provide a comprehensive QA evaluation.

${formattedTranscript}

Please analyze this call across the following 8 dimensions, scoring each from 0-10:

1. **Rapport Building** (rapport): How well did the agent establish connection and trust with the customer?
   - 8-10: Excellent rapport, warm and personable, builds strong connection
   - 5-7: Adequate rapport, professional but somewhat distant
   - 0-4: Poor rapport, cold or impersonal interaction

2. **Needs Discovery** (needsDiscovery): How effectively did the agent identify customer needs and pain points?
   - 8-10: Thorough discovery, asked probing questions, uncovered key needs
   - 5-7: Basic discovery, identified some needs but missed opportunities
   - 0-4: Poor discovery, failed to understand customer needs

3. **Product Knowledge** (productKnowledge): How well did the agent demonstrate understanding of products/services?
   - 8-10: Expert knowledge, confident explanations, handled complex questions
   - 5-7: Adequate knowledge, answered most questions correctly
   - 0-4: Poor knowledge, gave incorrect or incomplete information

4. **Objection Handling** (objectionHandling): How effectively did the agent address concerns and objections?
   - 8-10: Excellent handling, addressed concerns thoroughly, turned objections into opportunities
   - 5-7: Adequate handling, addressed concerns but lacked confidence
   - 0-4: Poor handling, avoided or dismissed objections

5. **Closing Techniques** (closing): How well did the agent move toward a resolution or next step?
   - 8-10: Strong close, clear next steps, gained commitment
   - 5-7: Adequate close, some next steps but lacked clarity
   - 0-4: Weak or no close, left customer uncertain

6. **Compliance** (compliance): Did the agent follow required scripts, disclosures, and legal requirements?
   - 8-10: Full compliance, all required elements covered
   - 5-7: Mostly compliant, minor omissions
   - 0-4: Non-compliant, missed critical requirements

7. **Professionalism** (professionalism): How professional was the agent's communication and demeanor?
   - 8-10: Highly professional, polished communication, appropriate tone
   - 5-7: Adequately professional, occasional lapses
   - 0-4: Unprofessional behavior or communication

8. **Follow-Up** (followUp): How well did the agent set expectations for next steps and follow-up?
   - 8-10: Clear follow-up plan, documented action items, set expectations
   - 5-7: Basic follow-up, some next steps mentioned
   - 0-4: No follow-up plan or unclear next steps

Additionally, identify:
- **Key Moments**: 8-12 specific moments spread across ALL 8 dimensions above. Each moment must:
  - Include the exact dimension category (rapport, needsDiscovery, productKnowledge, objectionHandling, closing, compliance, professionalism, followUp)
  - Have a precise timestamp in seconds matching the transcript
  - **CRITICAL**: Include an EXACT, VERBATIM quote copied directly from the transcript - DO NOT paraphrase, summarize, or infer dialogue
  - The quote must be a direct copy-paste from the transcript text, not a summary or interpretation
  - If you cannot find an exact quote, skip that moment rather than inventing dialogue
  - Be marked as positive, negative, or neutral
  - Provide context for why this moment matters for that dimension
  - TRY TO INCLUDE AT LEAST ONE MOMENT FOR EACH OF THE 8 DIMENSIONS
- **Call Outcome**: Brief description of how the call ended (e.g., "Sale closed", "Follow-up scheduled", "Customer declined")
- **Coaching Recommendations**: 3-5 specific, actionable coaching points for the agent
- **Compliance Issues**: Any compliance violations or concerns with severity level (minor/moderate/critical), description, and timestamp (empty array if none)
- **Summary**: 2-3 sentence overall summary of the call

Respond in the following JSON format (and ONLY JSON, no markdown formatting):

{
  "overallScore": 7.5,
  "scores": {
    "rapport": 8,
    "needsDiscovery": 7,
    "productKnowledge": 9,
    "objectionHandling": 6,
    "closing": 7,
    "compliance": 9,
    "professionalism": 8,
    "followUp": 7
  },
  "keyMoments": [
    {
      "timestamp": 45,
      "type": "positive",
      "category": "rapport",
      "description": "Agent showed empathy for customer's situation",
      "quote": "I completely understand how frustrating that must be for you"
    }
  ],
  "coachingRecommendations": [
    "Practice more probing questions during needs discovery phase",
    "Work on confidence when handling price objections"
  ],
  "summary": "Agent successfully closed the sale with strong product knowledge. Could improve objection handling and needs discovery.",
  "callOutcome": "Sale closed - customer purchased premium package",
  "complianceIssues": []
}`;
}
/**
 * Parse Claude's JSON response into typed analysis object
 */ function parseClaudeResponse(responseText) {
    try {
        // Remove markdown code blocks if present
        let jsonText = responseText.trim();
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }
        // Extract JSON from response - find first { and last }
        const firstBrace = jsonText.indexOf('{');
        const lastBrace = jsonText.lastIndexOf('}');
        if (firstBrace === -1 || lastBrace === -1) {
            throw new Error('No JSON object found in response');
        }
        jsonText = jsonText.substring(firstBrace, lastBrace + 1);
        const parsed = JSON.parse(jsonText);
        // Validate and set defaults
        const analysis = {
            overallScore: parsed.overallScore || 0,
            scores: {
                rapport: parsed.scores?.rapport || 0,
                needsDiscovery: parsed.scores?.needsDiscovery || 0,
                productKnowledge: parsed.scores?.productKnowledge || 0,
                objectionHandling: parsed.scores?.objectionHandling || 0,
                closing: parsed.scores?.closing || 0,
                compliance: parsed.scores?.compliance || 0,
                professionalism: parsed.scores?.professionalism || 0,
                followUp: parsed.scores?.followUp || 0
            },
            keyMoments: parsed.keyMoments || [],
            coachingRecommendations: parsed.coachingRecommendations || [],
            summary: parsed.summary || 'No summary provided',
            callOutcome: parsed.callOutcome || 'Unknown outcome',
            complianceIssues: parsed.complianceIssues || []
        };
        return analysis;
    } catch (error) {
        console.error('Failed to parse Claude response:', error);
        console.error('Raw response:', responseText);
        throw new Error('Failed to parse analysis response from Claude');
    }
}
/**
 * Validate that quotes in key moments actually exist in the transcript
 * Filters out hallucinated quotes to ensure data reliability
 */ function validateQuotes(keyMoments, transcript) {
    return keyMoments.filter((moment)=>{
        const { timestamp, quote } = moment;
        // Find turns within +/- 30 seconds of the timestamp
        const relevantTurns = transcript.turns.filter((turn)=>Math.abs(turn.timestamp - timestamp) <= 30);
        // Check if quote exists in any of the relevant turns (fuzzy match)
        // Extract significant words (length > 3) for matching
        const quoteWords = quote.toLowerCase().split(/\s+/).filter((w)=>w.length > 3);
        const minMatchWords = Math.max(3, Math.floor(quoteWords.length * 0.6)); // At least 60% of words should match
        for (const turn of relevantTurns){
            const turnWords = turn.text.toLowerCase().split(/\s+/);
            let matchedWords = 0;
            for (const word of quoteWords){
                if (turnWords.some((tw)=>tw.includes(word) || word.includes(tw))) {
                    matchedWords++;
                }
            }
            if (matchedWords >= minMatchWords) {
                return true; // Quote verified
            }
        }
        // Quote could not be verified - log and filter out
        console.warn(`[ANALYSIS VALIDATION] Filtered out potentially hallucinated quote at ${Math.floor(timestamp / 60)}:${Math.floor(timestamp % 60)} - "${quote.substring(0, 50)}..."`);
        return false;
    });
}
function estimateAnalysisCost(transcript) {
    // Rough estimate: ~1.5 tokens per word
    const transcriptWords = transcript.turns.reduce((sum, turn)=>sum + turn.text.split(' ').length, 0);
    const promptWords = 800; // Approximate system prompt + instructions
    const totalWords = transcriptWords + promptWords;
    const inputTokens = Math.ceil(totalWords * 1.5);
    // Estimated output: ~1000 tokens for comprehensive analysis
    const outputTokens = 1000;
    // Claude Sonnet 4.5 pricing: $3/MTok input, $15/MTok output
    const inputCost = inputTokens / 1_000_000 * 3;
    const outputCost = outputTokens / 1_000_000 * 15;
    return inputCost + outputCost;
}
function formatAnalysisAsText(analysis) {
    const lines = [];
    lines.push('='.repeat(80));
    lines.push('QA ANALYSIS REPORT');
    lines.push('='.repeat(80));
    lines.push('');
    lines.push(`Call ID: ${analysis.callId}`);
    lines.push(`Overall Score: ${analysis.overallScore.toFixed(1)}/10`);
    lines.push('');
    lines.push('DIMENSIONAL SCORES:');
    lines.push('-'.repeat(80));
    Object.entries(analysis.scores).forEach(([dimension, score])=>{
        const label = dimension.replace(/([A-Z])/g, ' $1').trim();
        const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);
        lines.push(`${capitalizedLabel.padEnd(25)} ${score.toFixed(1)}/10`);
    });
    lines.push('');
    lines.push('SUMMARY:');
    lines.push('-'.repeat(80));
    lines.push(analysis.summary);
    lines.push('');
    lines.push(`CALL OUTCOME: ${analysis.callOutcome}`);
    lines.push('');
    if (analysis.keyMoments.length > 0) {
        lines.push('KEY MOMENTS:');
        lines.push('-'.repeat(80));
        analysis.keyMoments.forEach((moment, idx)=>{
            const timestamp = formatTimestamp(moment.timestamp);
            const typeEmoji = moment.type === 'positive' ? '✅' : moment.type === 'negative' ? '❌' : '➖';
            lines.push(`${idx + 1}. [${timestamp}] ${typeEmoji} ${moment.category.toUpperCase()}`);
            lines.push(`   ${moment.description}`);
            lines.push(`   "${moment.quote}"`);
            lines.push('');
        });
    }
    if (analysis.coachingRecommendations.length > 0) {
        lines.push('COACHING RECOMMENDATIONS:');
        lines.push('-'.repeat(80));
        analysis.coachingRecommendations.forEach((rec, idx)=>{
            lines.push(`${idx + 1}. ${rec}`);
        });
        lines.push('');
    }
    if (analysis.complianceIssues && analysis.complianceIssues.length > 0) {
        lines.push('⚠️  COMPLIANCE ISSUES:');
        lines.push('-'.repeat(80));
        analysis.complianceIssues.forEach((issue, idx)=>{
            lines.push(`${idx + 1}. ${issue}`);
        });
        lines.push('');
    }
    lines.push(`Processing Time: ${Math.floor(analysis.processingTime / 1000)}s`);
    return lines.join('\n');
}
}),
"[externals]/fs/promises [external] (fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs/promises", () => require("fs/promises"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/src/lib/storage.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addCall",
    ()=>addCall,
    "deleteCall",
    ()=>deleteCall,
    "ensureDirectories",
    ()=>ensureDirectories,
    "fileExists",
    ()=>fileExists,
    "generateCallId",
    ()=>generateCallId,
    "getAnalysis",
    ()=>getAnalysis,
    "getCallById",
    ()=>getCallById,
    "getCompleteCallData",
    ()=>getCompleteCallData,
    "getStorageStats",
    ()=>getStorageStats,
    "getTranscript",
    ()=>getTranscript,
    "getTranscriptText",
    ()=>getTranscriptText,
    "getUploadPath",
    ()=>getUploadPath,
    "readCalls",
    ()=>readCalls,
    "saveAnalysis",
    ()=>saveAnalysis,
    "saveTranscript",
    ()=>saveTranscript,
    "saveTranscriptAsText",
    ()=>saveTranscriptAsText,
    "saveUploadedFile",
    ()=>saveUploadedFile,
    "updateCall",
    ()=>updateCall,
    "writeCalls",
    ()=>writeCalls
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs/promises [external] (fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
const DATA_DIR = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), 'data');
const CALLS_FILE = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(DATA_DIR, 'calls', 'calls.json');
const UPLOADS_DIR = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(DATA_DIR, 'uploads');
const TRANSCRIPTS_DIR = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(DATA_DIR, 'transcripts');
const ANALYSES_DIR = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(DATA_DIR, 'analyses');
async function ensureDirectories() {
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].mkdir(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(DATA_DIR, 'calls'), {
        recursive: true
    });
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].mkdir(UPLOADS_DIR, {
        recursive: true
    });
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].mkdir(TRANSCRIPTS_DIR, {
        recursive: true
    });
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].mkdir(ANALYSES_DIR, {
        recursive: true
    });
}
async function readCalls() {
    try {
        const data = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].readFile(CALLS_FILE, 'utf-8');
        const calls = JSON.parse(data);
        // Remove duplicates based on ID (keep first occurrence)
        const seen = new Set();
        const uniqueCalls = calls.filter((call)=>{
            if (seen.has(call.id)) {
                return false;
            }
            seen.add(call.id);
            return true;
        });
        // If duplicates were found, write the deduplicated list back
        if (uniqueCalls.length !== calls.length) {
            console.log(`Removed ${calls.length - uniqueCalls.length} duplicate call(s)`);
            await writeCalls(uniqueCalls);
        }
        // Sort by updatedAt descending (most recent first)
        const sortedCalls = uniqueCalls.sort((a, b)=>{
            const dateA = new Date(a.updatedAt).getTime();
            const dateB = new Date(b.updatedAt).getTime();
            return dateB - dateA; // Descending order
        });
        return sortedCalls;
    } catch (error) {
        // If file doesn't exist, return empty array
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}
// Mutex lock for preventing concurrent writes
let writeQueue = Promise.resolve();
async function writeCalls(calls) {
    // Wait for any pending writes to complete
    await writeQueue;
    // Queue this write operation
    writeQueue = (async ()=>{
        try {
            await ensureDirectories();
            await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].writeFile(CALLS_FILE, JSON.stringify(calls, null, 2), 'utf-8');
        } catch (error) {
            console.error('[STORAGE] Failed to write calls:', error);
            throw error;
        }
    })();
    await writeQueue;
}
async function addCall(call) {
    const calls = await readCalls();
    // Check if call already exists
    const existingIndex = calls.findIndex((c)=>c.id === call.id);
    if (existingIndex !== -1) {
        // Update existing call instead of adding duplicate
        calls[existingIndex] = call;
    } else {
        calls.push(call);
    }
    await writeCalls(calls);
    return call;
}
async function getCallById(id) {
    const calls = await readCalls();
    return calls.find((call)=>call.id === id) || null;
}
async function updateCall(id, updates) {
    const calls = await readCalls();
    const index = calls.findIndex((call)=>call.id === id);
    if (index === -1) {
        return null;
    }
    calls[index] = {
        ...calls[index],
        ...updates,
        updatedAt: new Date()
    };
    await writeCalls(calls);
    return calls[index];
}
async function saveUploadedFile(buffer, filename) {
    await ensureDirectories();
    const filepath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(UPLOADS_DIR, filename);
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].writeFile(filepath, buffer);
    return filepath;
}
function getUploadPath(filename) {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(UPLOADS_DIR, filename);
}
async function fileExists(filename) {
    try {
        await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].access(getUploadPath(filename));
        return true;
    } catch  {
        return false;
    }
}
function generateCallId() {
    return `call_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
async function saveTranscript(transcript) {
    await ensureDirectories();
    const jsonPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(TRANSCRIPTS_DIR, `${transcript.callId}.json`);
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].writeFile(jsonPath, JSON.stringify(transcript, null, 2), 'utf-8');
}
async function saveTranscriptAsText(callId, textContent) {
    await ensureDirectories();
    const txtPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(TRANSCRIPTS_DIR, `${callId}.txt`);
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].writeFile(txtPath, textContent, 'utf-8');
}
async function getTranscript(callId) {
    try {
        const jsonPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(TRANSCRIPTS_DIR, `${callId}.json`);
        const data = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].readFile(jsonPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return null;
        }
        throw error;
    }
}
async function getTranscriptText(callId) {
    try {
        const txtPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(TRANSCRIPTS_DIR, `${callId}.txt`);
        return await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].readFile(txtPath, 'utf-8');
    } catch (error) {
        if (error.code === 'ENOENT') {
            return null;
        }
        throw error;
    }
}
async function saveAnalysis(analysis) {
    await ensureDirectories();
    const jsonPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(ANALYSES_DIR, `${analysis.callId}.json`);
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].writeFile(jsonPath, JSON.stringify(analysis, null, 2), 'utf-8');
}
async function getAnalysis(callId) {
    try {
        const jsonPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(ANALYSES_DIR, `${callId}.json`);
        const data = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].readFile(jsonPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return null;
        }
        throw error;
    }
}
async function getCompleteCallData(callId) {
    const [call, transcript, analysis] = await Promise.all([
        getCallById(callId),
        getTranscript(callId),
        getAnalysis(callId)
    ]);
    return {
        call,
        transcript,
        analysis
    };
}
async function deleteCall(callId) {
    try {
        // Remove from calls.json
        const calls = await readCalls();
        const filtered = calls.filter((call)=>call.id !== callId);
        await writeCalls(filtered);
        // Delete transcript files
        try {
            await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].unlink(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(TRANSCRIPTS_DIR, `${callId}.json`));
        } catch  {}
        try {
            await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].unlink(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(TRANSCRIPTS_DIR, `${callId}.txt`));
        } catch  {}
        // Delete analysis file
        try {
            await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].unlink(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(ANALYSES_DIR, `${callId}.json`));
        } catch  {}
        // Delete uploaded audio file (if exists)
        const call = await getCallById(callId);
        if (call?.filename) {
            try {
                await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].unlink(getUploadPath(call.filename));
            } catch  {}
        }
        return true;
    } catch (error) {
        console.error('Error deleting call:', error);
        return false;
    }
}
async function getStorageStats() {
    const calls = await readCalls();
    const stats = {
        totalCalls: calls.length,
        uploadedCalls: calls.filter((c)=>c.status === 'pending').length,
        transcribedCalls: calls.filter((c)=>c.status === 'analyzing' || c.status === 'complete').length,
        analyzedCalls: calls.filter((c)=>c.status === 'complete').length,
        errorCalls: calls.filter((c)=>c.status === 'error').length,
        totalStorageBytes: 0
    };
    // Calculate total storage size
    try {
        const transcriptFiles = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].readdir(TRANSCRIPTS_DIR);
        const analysisFiles = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].readdir(ANALYSES_DIR);
        const uploadFiles = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].readdir(UPLOADS_DIR);
        for (const file of transcriptFiles){
            const stat = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].stat(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(TRANSCRIPTS_DIR, file));
            stats.totalStorageBytes += stat.size;
        }
        for (const file of analysisFiles){
            const stat = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].stat(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(ANALYSES_DIR, file));
            stats.totalStorageBytes += stat.size;
        }
        for (const file of uploadFiles){
            const stat = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].stat(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(UPLOADS_DIR, file));
            stats.totalStorageBytes += stat.size;
        }
    } catch (error) {
        console.error('Error calculating storage size:', error);
    }
    return stats;
}
}),
"[project]/src/app/api/analyze/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claude$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/claude-service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/storage.ts [app-route] (ecmascript)");
;
;
;
async function POST(request) {
    try {
        // Validate API key is configured
        if (!process.env.ANTHROPIC_API_KEY) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'ANTHROPIC_API_KEY not configured'
            }, {
                status: 500
            });
        }
        // Parse request body
        const body = await request.json();
        let transcript;
        // Support both callId and direct transcript
        if (body.callId) {
            const storedTranscript = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTranscript"])(body.callId);
            if (!storedTranscript) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Transcript not found for this call'
                }, {
                    status: 404
                });
            }
            transcript = storedTranscript;
        } else if (body.transcript) {
            transcript = body.transcript;
        } else {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Either callId or transcript is required'
            }, {
                status: 400
            });
        }
        // Validate transcript
        if (!transcript || !transcript.callId || !Array.isArray(transcript.turns)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid transcript format'
            }, {
                status: 400
            });
        }
        if (transcript.turns.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Transcript is empty'
            }, {
                status: 400
            });
        }
        // Estimate cost before analysis
        const estimatedCost = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claude$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateAnalysisCost"])(transcript);
        console.log(`Analyzing transcript ${transcript.callId} (estimated cost: $${estimatedCost.toFixed(4)})`);
        // Perform analysis
        const analysis = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claude$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["analyzeTranscript"])(transcript);
        // Save analysis to storage
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["saveAnalysis"])(analysis);
        // Update call status to complete
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateCall"])(transcript.callId, {
            status: 'complete',
            overallScore: analysis.overallScore,
            analysisUrl: `/data/analyses/${transcript.callId}.json`
        });
        // Return analysis results
        const response = {
            analysis,
            estimatedCost
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response, {
            status: 200
        });
    } catch (error) {
        console.error('Analysis API error:', error);
        // Try to update call status to error
        try {
            const body = await request.json();
            const callId = body.callId || body.transcript?.callId;
            if (callId) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateCall"])(callId, {
                    status: 'error',
                    errorMessage: error.message
                });
            }
        } catch  {}
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to analyze transcript',
            details: error.message
        }, {
            status: 500
        });
    }
}
async function GET() {
    const isConfigured = !!process.env.ANTHROPIC_API_KEY;
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        status: 'ok',
        service: 'Claude QA Analysis API',
        model: 'claude-sonnet-4.5-20250929',
        configured: isConfigured
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__237d7797._.js.map