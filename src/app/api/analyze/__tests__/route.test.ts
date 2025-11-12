import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from '../route';
import { NextRequest } from 'next/server';
import type { Transcript } from '@/types';

// Mock the claude-service module
vi.mock('@/lib/claude-service', () => ({
  analyzeTranscript: vi.fn().mockResolvedValue({
    callId: 'test-call-123',
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
    processingTime: 2500,
  }),
  estimateAnalysisCost: vi.fn().mockReturnValue(0.025),
}));

describe('POST /api/analyze', () => {
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
    ],
    durationSeconds: 120,
    language: 'en',
    processingTime: 5000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Set up environment variable
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key-123';
  });

  it('should analyze a valid transcript', async () => {
    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ transcript: mockTranscript }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.analysis).toBeDefined();
    expect(data.analysis.callId).toBe('test-call-123');
    expect(data.analysis.overallScore).toBe(7.5);
    expect(data.estimatedCost).toBe(0.025);
  });

  it('should return 400 for invalid transcript format', async () => {
    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ transcript: { invalid: 'data' } }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid transcript format');
  });

  it('should return 400 for empty transcript', async () => {
    const emptyTranscript: Transcript = {
      ...mockTranscript,
      turns: [],
    };

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ transcript: emptyTranscript }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Transcript is empty');
  });

  it('should return 500 if API key is not configured', async () => {
    delete process.env.ANTHROPIC_API_KEY;

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ transcript: mockTranscript }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('ANTHROPIC_API_KEY not configured');
  });

  it('should handle analysis errors gracefully', async () => {
    const { analyzeTranscript } = await import('@/lib/claude-service');
    vi.mocked(analyzeTranscript).mockRejectedValueOnce(new Error('Claude API error'));

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ transcript: mockTranscript }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to analyze transcript');
    expect(data.details).toBe('Claude API error');
  });
});

describe('GET /api/analyze', () => {
  it('should return API status with configuration', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key-123';

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.service).toBe('Claude QA Analysis API');
    expect(data.model).toBe('claude-sonnet-4.5-20250929');
    expect(data.configured).toBe(true);
  });

  it('should indicate when API key is not configured', async () => {
    delete process.env.ANTHROPIC_API_KEY;

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.configured).toBe(false);
  });
});
