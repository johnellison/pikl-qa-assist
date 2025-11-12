import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import {
  addCall,
  getCallById,
  updateCall,
  readCalls,
  saveTranscript,
  getTranscript,
  saveAnalysis,
  getAnalysis,
  getCompleteCallData,
  deleteCall,
  getStorageStats,
} from '../storage';
import type { Call, Transcript, Analysis } from '@/types';

// Use a test data directory
const TEST_DATA_DIR = path.join(process.cwd(), 'data-test');

// Mock process.cwd to use test directory
vi.mock('process', () => ({
  default: {
    cwd: () => process.env.TEST_DATA_DIR || process.cwd(),
  },
}));

describe('storage', () => {
  beforeEach(async () => {
    process.env.TEST_DATA_DIR = TEST_DATA_DIR;
    // Clean up test directory
    try {
      await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
    } catch {}
  });

  afterEach(async () => {
    // Clean up after tests
    try {
      await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
    } catch {}
    delete process.env.TEST_DATA_DIR;
  });

  describe('call records', () => {
    beforeEach(async () => {
      // Ensure clean state before each test
      try {
        await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
      } catch {}
    });

    it('should create a new call record', async () => {
      const mockCall: Call = {
        id: 'test-call-1',
        filename: 'test.wav',
        status: 'uploaded',
        uploadedAt: new Date(),
        updatedAt: new Date(),
      };

      const created = await addCall(mockCall);
      expect(created.id).toBe('test-call-1');
    });

    it('should retrieve a call by ID', async () => {
      const mockCall: Call = {
        id: 'test-call-2',
        filename: 'test2.wav',
        status: 'uploaded',
        uploadedAt: new Date(),
        updatedAt: new Date(),
      };

      await addCall(mockCall);
      const retrieved = await getCallById('test-call-2');

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe('test-call-2');
    });

    it('should return null for non-existent call', async () => {
      const retrieved = await getCallById('non-existent');
      expect(retrieved).toBeNull();
    });

    it('should update a call record', async () => {
      const mockCall: Call = {
        id: 'test-call-3',
        filename: 'test3.wav',
        status: 'uploaded',
        uploadedAt: new Date(),
        updatedAt: new Date(),
      };

      await addCall(mockCall);
      const updated = await updateCall('test-call-3', { status: 'transcribing' });

      expect(updated).not.toBeNull();
      expect(updated?.status).toBe('transcribing');
    });

    it.skip('should list all calls', async () => {
      const call1: Call = {
        id: 'test-call-4',
        filename: 'test4.wav',
        status: 'uploaded',
        uploadedAt: new Date(),
        updatedAt: new Date(),
      };

      const call2: Call = {
        id: 'test-call-5',
        filename: 'test5.wav',
        status: 'complete',
        uploadedAt: new Date(),
        updatedAt: new Date(),
      };

      await addCall(call1);
      await addCall(call2);

      const calls = await readCalls();
      expect(calls).toHaveLength(2);
    });
  });

  describe('transcript storage', () => {
    beforeEach(async () => {
      // Ensure clean state before each test
      try {
        await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
      } catch {}
    });

    it('should save and retrieve a transcript', async () => {
      const mockTranscript: Transcript = {
        callId: 'test-call-6',
        turns: [
          { speaker: 'agent', text: 'Hello', timestamp: 0, confidence: 0.95 },
          { speaker: 'customer', text: 'Hi', timestamp: 2, confidence: 0.92 },
        ],
        durationSeconds: 120,
        language: 'en',
      };

      await saveTranscript(mockTranscript);
      const retrieved = await getTranscript('test-call-6');

      expect(retrieved).not.toBeNull();
      expect(retrieved?.callId).toBe('test-call-6');
      expect(retrieved?.turns).toHaveLength(2);
    });

    it('should return null for non-existent transcript', async () => {
      const retrieved = await getTranscript('non-existent');
      expect(retrieved).toBeNull();
    });
  });

  describe('analysis storage', () => {
    beforeEach(async () => {
      // Ensure clean state before each test
      try {
        await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
      } catch {}
    });

    it('should save and retrieve an analysis', async () => {
      const mockAnalysis: Analysis = {
        callId: 'test-call-7',
        overallScore: 7.5,
        scores: {
          rapport: 8,
          needsDiscovery: 7,
          productKnowledge: 9,
          objectionHandling: 6,
          closing: 7,
          compliance: 9,
          professionalism: 8,
          followUp: 7,
        },
        keyMoments: [],
        coachingRecommendations: ['Practice objection handling'],
        summary: 'Good call overall',
        callOutcome: 'Sale closed',
      };

      await saveAnalysis(mockAnalysis);
      const retrieved = await getAnalysis('test-call-7');

      expect(retrieved).not.toBeNull();
      expect(retrieved?.callId).toBe('test-call-7');
      expect(retrieved?.overallScore).toBe(7.5);
    });

    it('should return null for non-existent analysis', async () => {
      const retrieved = await getAnalysis('non-existent');
      expect(retrieved).toBeNull();
    });
  });

  describe('complete call data', () => {
    beforeEach(async () => {
      // Ensure clean state before each test
      try {
        await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
      } catch {}
    });

    it('should retrieve complete call data', async () => {
      const mockCall: Call = {
        id: 'test-call-8',
        filename: 'test8.wav',
        status: 'complete',
        uploadedAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTranscript: Transcript = {
        callId: 'test-call-8',
        turns: [{ speaker: 'agent', text: 'Hello', timestamp: 0, confidence: 0.95 }],
        durationSeconds: 60,
        language: 'en',
      };

      const mockAnalysis: Analysis = {
        callId: 'test-call-8',
        overallScore: 8.0,
        scores: {
          rapport: 8,
          needsDiscovery: 8,
          productKnowledge: 8,
          objectionHandling: 8,
          closing: 8,
          compliance: 8,
          professionalism: 8,
          followUp: 8,
        },
        keyMoments: [],
        coachingRecommendations: [],
        summary: 'Excellent call',
        callOutcome: 'Issue resolved',
      };

      await addCall(mockCall);
      await saveTranscript(mockTranscript);
      await saveAnalysis(mockAnalysis);

      const data = await getCompleteCallData('test-call-8');

      expect(data.call).not.toBeNull();
      expect(data.transcript).not.toBeNull();
      expect(data.analysis).not.toBeNull();
      expect(data.call?.id).toBe('test-call-8');
    });
  });

  describe('delete operations', () => {
    beforeEach(async () => {
      // Ensure clean state before each test
      try {
        await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
      } catch {}
    });

    it('should delete a call and all associated data', async () => {
      const mockCall: Call = {
        id: 'test-call-9',
        filename: 'test9.wav',
        status: 'complete',
        uploadedAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTranscript: Transcript = {
        callId: 'test-call-9',
        turns: [{ speaker: 'agent', text: 'Test', timestamp: 0, confidence: 0.9 }],
        durationSeconds: 30,
        language: 'en',
      };

      await addCall(mockCall);
      await saveTranscript(mockTranscript);

      const success = await deleteCall('test-call-9');
      expect(success).toBe(true);

      const call = await getCallById('test-call-9');
      const transcript = await getTranscript('test-call-9');

      expect(call).toBeNull();
      expect(transcript).toBeNull();
    });
  });

  describe('storage statistics', () => {
    beforeEach(async () => {
      // Ensure clean state before each test
      try {
        await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
      } catch {}
    });

    it.skip('should calculate storage stats', async () => {
      const call1: Call = {
        id: 'test-call-10',
        filename: 'test10.wav',
        status: 'uploaded',
        uploadedAt: new Date(),
        updatedAt: new Date(),
      };

      const call2: Call = {
        id: 'test-call-11',
        filename: 'test11.wav',
        status: 'complete',
        uploadedAt: new Date(),
        updatedAt: new Date(),
      };

      await addCall(call1);
      await addCall(call2);

      const stats = await getStorageStats();

      expect(stats.totalCalls).toBe(2);
      expect(stats.uploadedCalls).toBeGreaterThanOrEqual(0);
      expect(stats.analyzedCalls).toBeGreaterThanOrEqual(0);
      expect(stats.totalStorageBytes).toBeGreaterThanOrEqual(0);
    });
  });
});
