import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeTranscript, estimateAnalysisCost } from '../claude-service';
import type { Transcript } from '@/types';

// Mock Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => {
  const mockCreate = vi.fn().mockResolvedValue({
    content: [
      {
        type: 'text',
        text: JSON.stringify({
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
          keyMoments: [
            {
              timestamp: 45,
              type: 'positive',
              category: 'rapport',
              description: 'Agent showed empathy',
              quote: 'I understand how you feel',
            },
          ],
          coachingRecommendations: [
            'Practice more probing questions',
            'Work on confidence with objections',
          ],
          summary: 'Strong call with good product knowledge',
          callOutcome: 'Sale closed',
          complianceIssues: [],
        }),
      },
    ],
  });

  return {
    default: class MockAnthropic {
      messages = {
        create: mockCreate,
      };
    },
  };
});

describe('claude-service', () => {
  const mockTranscript: Transcript = {
    callId: 'test-call-123',
    turns: [
      {
        speaker: 'agent',
        text: 'Hello, how can I help you today?',
        timestamp: 0,
        confidence: 0.95,
      },
      {
        speaker: 'customer',
        text: 'I am interested in your premium package',
        timestamp: 5,
        confidence: 0.92,
      },
      {
        speaker: 'agent',
        text: 'Great! Let me tell you about our premium features.',
        timestamp: 10,
        confidence: 0.96,
      },
    ],
    durationSeconds: 120,
    language: 'en',
    processingTime: 5000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeTranscript', () => {
    it('should analyze a transcript and return analysis results', async () => {
      const analysis = await analyzeTranscript(mockTranscript);

      expect(analysis).toBeDefined();
      expect(analysis.callId).toBe('test-call-123');
      expect(analysis.overallScore).toBe(7.5);
      expect(analysis.scores).toBeDefined();
      expect(analysis.scores.rapport).toBe(8);
      expect(analysis.keyMoments).toHaveLength(1);
      expect(analysis.coachingRecommendations).toHaveLength(2);
      expect(analysis.summary).toBe('Strong call with good product knowledge');
      expect(analysis.callOutcome).toBe('Sale closed');
    });

    it('should include all 8 QA dimension scores', async () => {
      const analysis = await analyzeTranscript(mockTranscript);

      expect(analysis.scores).toHaveProperty('rapport');
      expect(analysis.scores).toHaveProperty('needsDiscovery');
      expect(analysis.scores).toHaveProperty('productKnowledge');
      expect(analysis.scores).toHaveProperty('objectionHandling');
      expect(analysis.scores).toHaveProperty('closing');
      expect(analysis.scores).toHaveProperty('compliance');
      expect(analysis.scores).toHaveProperty('professionalism');
      expect(analysis.scores).toHaveProperty('followUp');
    });

    it('should include processing time', async () => {
      const analysis = await analyzeTranscript(mockTranscript);

      expect(analysis.processingTime).toBeDefined();
      expect(typeof analysis.processingTime).toBe('number');
      expect(analysis.processingTime!).toBeGreaterThanOrEqual(0);
    });

    it('should handle key moments correctly', async () => {
      const analysis = await analyzeTranscript(mockTranscript);

      expect(analysis.keyMoments[0]).toMatchObject({
        timestamp: 45,
        type: 'positive',
        category: 'rapport',
        description: 'Agent showed empathy',
        quote: 'I understand how you feel',
      });
    });
  });

  describe('estimateAnalysisCost', () => {
    it('should estimate cost based on transcript length', () => {
      const cost = estimateAnalysisCost(mockTranscript);

      expect(cost).toBeGreaterThan(0);
      expect(typeof cost).toBe('number');
    });

    it('should return higher cost for longer transcripts', () => {
      const shortTranscript: Transcript = {
        ...mockTranscript,
        turns: [mockTranscript.turns[0]],
      };

      const longTranscript: Transcript = {
        ...mockTranscript,
        turns: [
          ...mockTranscript.turns,
          ...mockTranscript.turns,
          ...mockTranscript.turns,
        ],
      };

      const shortCost = estimateAnalysisCost(shortTranscript);
      const longCost = estimateAnalysisCost(longTranscript);

      expect(longCost).toBeGreaterThan(shortCost);
    });

    it('should return reasonable cost estimates', () => {
      const cost = estimateAnalysisCost(mockTranscript);

      // Cost should be in reasonable range (less than $1 for typical call)
      expect(cost).toBeLessThan(1);
      expect(cost).toBeGreaterThan(0.001);
    });
  });
});
