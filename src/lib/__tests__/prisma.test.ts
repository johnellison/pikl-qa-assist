import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { prisma } from '../prisma';
import type { Call, Analysis } from '@prisma/client';

describe('Prisma Persistence Layer', () => {
  // Sample test data
  const testCallId = `test_call_${Date.now()}`;
  const testCall = {
    id: `test_${Date.now()}`,
    filename: 'test-call.mp3',
    agentName: 'Test Agent',
    agentId: 'agent_test_001',
    phoneNumber: '+441234567890',
    callId: testCallId,
    timestamp: new Date(),
    duration: 300,
    status: 'complete',
    transcriptUrl: '/data/transcripts/test.json',
    analysisUrl: '/data/analyses/test.json',
    overallScore: 8.5,
    qaScore: 8.7,
    complianceScore: 8.2,
    callType: 'general_inquiry',
  };

  beforeAll(async () => {
    // Ensure database connection
    await prisma.$connect();
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.call.deleteMany({
      where: {
        id: {
          startsWith: 'test_',
        },
      },
    });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up before each test
    await prisma.call.deleteMany({
      where: {
        id: {
          startsWith: 'test_',
        },
      },
    });
  });

  describe('Call CRUD Operations', () => {
    it('should create a new call record', async () => {
      const call = await prisma.call.create({
        data: testCall,
      });

      expect(call).toBeDefined();
      expect(call.id).toBe(testCall.id);
      expect(call.callId).toBe(testCall.callId);
      expect(call.agentName).toBe(testCall.agentName);
      expect(call.overallScore).toBe(testCall.overallScore);
    });

    it('should read a call record by callId', async () => {
      // Create call first
      await prisma.call.create({ data: testCall });

      // Read call
      const call = await prisma.call.findUnique({
        where: { callId: testCallId },
      });

      expect(call).toBeDefined();
      expect(call?.callId).toBe(testCallId);
      expect(call?.agentName).toBe('Test Agent');
    });

    it('should update a call record', async () => {
      // Create call first
      await prisma.call.create({ data: testCall });

      // Update call
      const updatedCall = await prisma.call.update({
        where: { callId: testCallId },
        data: {
          status: 'analyzing',
          overallScore: 9.0,
        },
      });

      expect(updatedCall).toBeDefined();
      expect(updatedCall.status).toBe('analyzing');
      expect(updatedCall.overallScore).toBe(9.0);
    });

    it('should delete a call record', async () => {
      // Create call first
      await prisma.call.create({ data: testCall });

      // Delete call
      await prisma.call.delete({
        where: { callId: testCallId },
      });

      // Verify deletion
      const call = await prisma.call.findUnique({
        where: { callId: testCallId },
      });

      expect(call).toBeNull();
    });

    it('should list calls with filtering', async () => {
      // Create multiple calls
      await prisma.call.create({ data: testCall });
      await prisma.call.create({
        data: {
          ...testCall,
          id: `test_${Date.now()}_2`,
          callId: `${testCallId}_2`,
          status: 'pending',
        },
      });

      // Query with filter
      const completeCalls = await prisma.call.findMany({
        where: { status: 'complete' },
        orderBy: { timestamp: 'desc' },
      });

      expect(completeCalls.length).toBeGreaterThanOrEqual(1);
      expect(completeCalls[0].status).toBe('complete');
    });
  });

  describe('Transcript Operations', () => {
    it('should create a transcript linked to a call', async () => {
      // Create call first
      await prisma.call.create({ data: testCall });

      // Create transcript
      const transcript = await prisma.transcript.create({
        data: {
          callId: testCallId,
          text: 'This is a test transcript',
          segments: JSON.stringify([
            { speaker: 'Agent', text: 'Hello' },
            { speaker: 'Customer', text: 'Hi there' },
          ]),
          duration: 300,
        },
      });

      expect(transcript).toBeDefined();
      expect(transcript.callId).toBe(testCallId);
      expect(transcript.text).toBe('This is a test transcript');
    });

    it('should cascade delete transcript when call is deleted', async () => {
      // Create call and transcript
      await prisma.call.create({ data: testCall });
      await prisma.transcript.create({
        data: {
          callId: testCallId,
          text: 'Test transcript',
          segments: '[]',
          duration: 300,
        },
      });

      // Delete call
      await prisma.call.delete({
        where: { callId: testCallId },
      });

      // Verify transcript is also deleted
      const transcript = await prisma.transcript.findUnique({
        where: { callId: testCallId },
      });

      expect(transcript).toBeNull();
    });
  });

  describe('Analysis Operations', () => {
    it('should create a complete analysis with related data', async () => {
      // Create call first
      await prisma.call.create({ data: testCall });

      // Create analysis
      const analysis = await prisma.analysis.create({
        data: {
          callId: testCallId,
          callType: 'general_inquiry',
          overallScore: 8.5,
          qaScore: 8.7,
          complianceScore: 8.2,
          summary: 'Test analysis summary',
          callOutcome: 'Query resolved',
          processingTime: 5000,
        },
      });

      expect(analysis).toBeDefined();
      expect(analysis.callId).toBe(testCallId);
      expect(analysis.overallScore).toBe(8.5);
    });

    it('should create QA scores linked to analysis', async () => {
      // Create call and analysis
      await prisma.call.create({ data: testCall });
      const analysis = await prisma.analysis.create({
        data: {
          callId: testCallId,
          callType: 'general_inquiry',
          overallScore: 8.5,
          summary: 'Test',
          callOutcome: 'Test',
        },
      });

      // Create QA scores
      const scores = await prisma.qAScores.create({
        data: {
          analysisId: analysis.id,
          rapport: 9.0,
          needsDiscovery: 8.5,
          productKnowledge: 8.0,
          objectionHandling: 7.5,
          closing: 8.5,
          professionalism: 9.0,
          followUp: 8.0,
          callOpeningCompliance: 8.5,
          dataProtectionCompliance: 9.0,
          mandatoryDisclosures: 8.0,
          tcfCompliance: 8.5,
          salesProcessCompliance: null,
          complaintsHandling: null,
        },
      });

      expect(scores).toBeDefined();
      expect(scores.analysisId).toBe(analysis.id);
      expect(scores.rapport).toBe(9.0);
    });

    it('should create key moments linked to analysis', async () => {
      // Create call and analysis
      await prisma.call.create({ data: testCall });
      const analysis = await prisma.analysis.create({
        data: {
          callId: testCallId,
          callType: 'general_inquiry',
          overallScore: 8.5,
          summary: 'Test',
          callOutcome: 'Test',
        },
      });

      // Create key moments
      const keyMoments = await prisma.keyMoment.createMany({
        data: [
          {
            analysisId: analysis.id,
            timestamp: 30,
            type: 'positive',
            category: 'rapport',
            description: 'Great greeting',
            quote: 'Welcome to our service',
          },
          {
            analysisId: analysis.id,
            timestamp: 120,
            type: 'negative',
            category: 'productKnowledge',
            description: 'Incorrect information',
            quote: 'I think it might be...',
          },
        ],
      });

      expect(keyMoments.count).toBe(2);

      // Verify retrieval
      const moments = await prisma.keyMoment.findMany({
        where: { analysisId: analysis.id },
      });

      expect(moments.length).toBe(2);
      expect(moments[0].type).toBe('positive');
    });

    it('should create compliance issues with severity levels', async () => {
      // Create call and analysis
      await prisma.call.create({ data: testCall });
      const analysis = await prisma.analysis.create({
        data: {
          callId: testCallId,
          callType: 'general_inquiry',
          overallScore: 8.5,
          summary: 'Test',
          callOutcome: 'Test',
        },
      });

      // Create compliance issues
      const issues = await prisma.complianceIssue.createMany({
        data: [
          {
            analysisId: analysis.id,
            severity: 'critical',
            category: 'dataProtectionCompliance',
            issue: 'No DPA verification',
            regulatoryReference: 'GDPR Article 13',
            timestamp: 10,
            remediation: 'Always verify DPA before accessing data',
          },
          {
            analysisId: analysis.id,
            severity: 'medium',
            category: 'mandatoryDisclosures',
            issue: 'Incomplete firm identity disclosure',
            regulatoryReference: 'ICOBS 4.2.1R',
            timestamp: null,
            remediation: 'Provide full firm name and FCA number',
          },
        ],
      });

      expect(issues.count).toBe(2);

      // Query by severity
      const criticalIssues = await prisma.complianceIssue.findMany({
        where: {
          analysisId: analysis.id,
          severity: 'critical',
        },
      });

      expect(criticalIssues.length).toBe(1);
      expect(criticalIssues[0].category).toBe('dataProtectionCompliance');
    });

    it('should cascade delete all related data when analysis is deleted', async () => {
      // Create call and analysis with all related data
      await prisma.call.create({ data: testCall });
      const analysis = await prisma.analysis.create({
        data: {
          callId: testCallId,
          callType: 'general_inquiry',
          overallScore: 8.5,
          summary: 'Test',
          callOutcome: 'Test',
        },
      });

      await prisma.qAScores.create({
        data: {
          analysisId: analysis.id,
          rapport: 9.0,
          needsDiscovery: 8.5,
          productKnowledge: 8.0,
          objectionHandling: 7.5,
          closing: 8.5,
          professionalism: 9.0,
          followUp: 8.0,
          callOpeningCompliance: 8.5,
          dataProtectionCompliance: 9.0,
          mandatoryDisclosures: 8.0,
          tcfCompliance: 8.5,
        },
      });

      await prisma.keyMoment.create({
        data: {
          analysisId: analysis.id,
          timestamp: 30,
          type: 'positive',
          category: 'rapport',
          description: 'Test',
          quote: 'Test quote',
        },
      });

      // Delete analysis
      await prisma.analysis.delete({
        where: { id: analysis.id },
      });

      // Verify all related data is deleted
      const scores = await prisma.qAScores.findUnique({
        where: { analysisId: analysis.id },
      });
      const moments = await prisma.keyMoment.findMany({
        where: { analysisId: analysis.id },
      });

      expect(scores).toBeNull();
      expect(moments.length).toBe(0);
    });
  });

  describe('Query Performance', () => {
    it('should efficiently query calls with includes', async () => {
      // Create call with transcript and analysis
      await prisma.call.create({ data: testCall });
      await prisma.transcript.create({
        data: {
          callId: testCallId,
          text: 'Test transcript',
          segments: '[]',
          duration: 300,
        },
      });

      const analysis = await prisma.analysis.create({
        data: {
          callId: testCallId,
          callType: 'general_inquiry',
          overallScore: 8.5,
          summary: 'Test',
          callOutcome: 'Test',
        },
      });

      await prisma.qAScores.create({
        data: {
          analysisId: analysis.id,
          rapport: 9.0,
          needsDiscovery: 8.5,
          productKnowledge: 8.0,
          objectionHandling: 7.5,
          closing: 8.5,
          professionalism: 9.0,
          followUp: 8.0,
          callOpeningCompliance: 8.5,
          dataProtectionCompliance: 9.0,
          mandatoryDisclosures: 8.0,
          tcfCompliance: 8.5,
        },
      });

      // Query with all includes
      const startTime = Date.now();
      const completeCall = await prisma.call.findUnique({
        where: { callId: testCallId },
        include: {
          transcript: true,
          analysis: {
            include: {
              scores: true,
              keyMoments: true,
              coachingRecommendations: true,
              complianceIssues: true,
              outcomeMetrics: true,
            },
          },
        },
      });
      const queryTime = Date.now() - startTime;

      expect(completeCall).toBeDefined();
      expect(completeCall?.transcript).toBeDefined();
      expect(completeCall?.analysis).toBeDefined();
      expect(completeCall?.analysis?.scores).toBeDefined();
      expect(queryTime).toBeLessThan(100); // Should be fast
    });
  });
});
