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
"[project]/src/lib/whisper-service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateTranscriptionCost",
    ()=>estimateTranscriptionCost,
    "formatTranscriptAsText",
    ()=>formatTranscriptAsText,
    "transcribeAudio",
    ()=>transcribeAudio
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__OpenAI__as__default$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/client.mjs [app-route] (ecmascript) <export OpenAI as default>");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs/promises [external] (fs/promises, cjs)");
;
;
const openai = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__OpenAI__as__default$3e$__["default"]({
    apiKey: process.env.OPENAI_API_KEY
});
async function transcribeAudio(filePath, callId) {
    const startTime = Date.now();
    try {
        // Read the audio file
        const fileBuffer = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].readFile(filePath);
        const file = new File([
            fileBuffer
        ], filePath.split('/').pop() || 'audio.wav', {
            type: 'audio/wav'
        });
        // Call OpenAI Whisper API with verbose_json to get timestamps
        // Force English language to prevent misdetection (e.g., Welsh instead of English)
        const response = await openai.audio.transcriptions.create({
            file: file,
            model: 'whisper-1',
            response_format: 'verbose_json',
            timestamp_granularities: [
                'segment'
            ],
            language: 'en'
        });
        const processingTime = Date.now() - startTime;
        // Parse response and create transcript turns
        const turns = [];
        if (response.segments && Array.isArray(response.segments)) {
            // Simple speaker diarization heuristic:
            // - Alternating speakers based on pauses
            // - First speaker is assumed to be agent
            let currentSpeaker = 'agent';
            let lastEndTime = 0;
            response.segments.forEach((segment)=>{
                // If there's a significant pause (>2 seconds), assume speaker change
                const pause = segment.start - lastEndTime;
                if (pause > 2 && lastEndTime > 0) {
                    currentSpeaker = currentSpeaker === 'agent' ? 'customer' : 'agent';
                }
                turns.push({
                    speaker: currentSpeaker,
                    text: segment.text.trim(),
                    timestamp: segment.start,
                    confidence: 1 - (segment.no_speech_prob || 0)
                });
                lastEndTime = segment.end;
            });
        } else {
            // Fallback: single turn with full text
            turns.push({
                speaker: 'agent',
                text: response.text,
                timestamp: 0,
                confidence: 1
            });
        }
        const transcript = {
            callId,
            turns,
            durationSeconds: response.duration || 0,
            language: response.language,
            processingTime
        };
        return transcript;
    } catch (error) {
        console.error('Whisper transcription error:', error);
        throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
}
function estimateTranscriptionCost(durationSeconds) {
    const hours = durationSeconds / 3600;
    const costPerHour = 0.36; // $0.36 per hour
    return hours * costPerHour;
}
function formatTranscriptAsText(transcript) {
    const lines = [];
    lines.push('='.repeat(80));
    lines.push('CALL TRANSCRIPT');
    lines.push('='.repeat(80));
    lines.push('');
    lines.push(`Call ID: ${transcript.callId}`);
    lines.push(`Duration: ${Math.floor(transcript.durationSeconds / 60)}m ${Math.floor(transcript.durationSeconds % 60)}s`);
    lines.push(`Language: ${transcript.language || 'Unknown'}`);
    lines.push(`Processing Time: ${Math.floor(transcript.processingTime / 1000)}s`);
    lines.push('');
    lines.push('='.repeat(80));
    lines.push('');
    transcript.turns.forEach((turn, index)=>{
        const timestamp = formatTimestamp(turn.timestamp);
        const speaker = turn.speaker === 'agent' ? 'AGENT' : 'CUSTOMER';
        const confidence = Math.round((turn.confidence || 0) * 100);
        lines.push(`[${timestamp}] ${speaker} (${confidence}% confidence)`);
        lines.push(turn.text);
        lines.push('');
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
}),
"[project]/src/app/api/transcribe/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/storage.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$whisper$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/whisper-service.ts [app-route] (ecmascript)");
;
;
;
async function POST(req) {
    try {
        const body = await req.json();
        const { callId } = body;
        if (!callId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Call ID is required'
            }, {
                status: 400
            });
        }
        // Get call record
        const call = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCallById"])(callId);
        if (!call) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Call not found'
            }, {
                status: 404
            });
        }
        // Check if already transcribed
        if (call.status === 'analyzing' || call.status === 'complete') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Call already transcribed'
            }, {
                status: 400
            });
        }
        // Update status to transcribing
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateCall"])(callId, {
            status: 'transcribing'
        });
        // Get audio file path
        const audioPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUploadPath"])(call.filename);
        // Log file information before sending to Whisper
        const fs = await __turbopack_context__.A("[externals]/fs/promises [external] (fs/promises, cjs, async loader)");
        try {
            const fileStats = await fs.stat(audioPath);
            const fileSizeMB = (fileStats.size / 1024 / 1024).toFixed(2);
            console.log(`[TRANSCRIBE] Preparing to send file to Whisper API:`);
            console.log(`[TRANSCRIBE]   Call ID: ${callId}`);
            console.log(`[TRANSCRIBE]   Filename: ${call.filename}`);
            console.log(`[TRANSCRIBE]   Path: ${audioPath}`);
            console.log(`[TRANSCRIBE]   Size: ${fileSizeMB}MB (${fileStats.size} bytes)`);
            console.log(`[TRANSCRIBE]   Whisper limit: 25MB (${25 * 1024 * 1024} bytes)`);
            if (fileStats.size > 25 * 1024 * 1024) {
                console.warn(`[TRANSCRIBE] ⚠ WARNING: File exceeds 25MB Whisper API limit!`);
            } else {
                console.log(`[TRANSCRIBE] ✓ File is under Whisper API limit`);
            }
        } catch (statError) {
            console.error(`[TRANSCRIBE] Failed to stat file:`, statError);
        }
        try {
            // Transcribe audio
            const transcript = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$whisper$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transcribeAudio"])(audioPath, callId);
            // Save transcript as JSON
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["saveTranscript"])(transcript);
            // Save transcript as plain text
            const textContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$whisper$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatTranscriptAsText"])(transcript);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["saveTranscriptAsText"])(callId, textContent);
            // Estimate cost
            const cost = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$whisper$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateTranscriptionCost"])(transcript.durationSeconds);
            // Update call record
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateCall"])(callId, {
                status: 'analyzing',
                duration: transcript.durationSeconds,
                transcriptUrl: `/data/transcripts/${callId}.json`
            });
            // Trigger analysis asynchronously (don't wait)
            fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    callId
                })
            }).catch((err)=>console.error('Failed to trigger analysis:', err));
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                data: {
                    transcript,
                    cost
                },
                message: `Successfully transcribed call in ${Math.floor(transcript.processingTime / 1000)}s. Cost: $${cost.toFixed(4)}`
            }, {
                status: 200
            });
        } catch (transcribeError) {
            // Update call status to error
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateCall"])(callId, {
                status: 'error',
                errorMessage: transcribeError.message
            });
            throw transcribeError;
        }
    } catch (error) {
        console.error('Transcription error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Failed to transcribe audio',
            message: error.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__81d65f0e._.js.map