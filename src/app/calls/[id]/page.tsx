'use client';

import { useEffect, useState, useRef } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Clock,
  User,
  FileText,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import type { Call, Transcript, Analysis } from '@/types';
import type { QALogEntry } from '@/types/qa-log';
import { getScoreColor, getScoreBgColor, getScoreLabel, getScoreVariant, getProgressColor } from '@/lib/score-utils';
import { AgentAvatar } from '@/components/agent-avatar';
import { AudioPlayer, AudioPlayerRef } from '@/components/audio-player';
import { exportCallToPDF, exportCallToCSV } from '@/lib/export-utils';

export default function CallDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const audioPlayerRef = useRef<AudioPlayerRef>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [qaLogEntry, setQaLogEntry] = useState<QALogEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDimensions, setExpandedDimensions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchCallData();
  }, [id]);

  const handleTimestampClick = (timestamp: number) => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.seekTo(timestamp);
      audioPlayerRef.current.play();
      // Scroll to audio player
      document.getElementById('audio-player')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  async function fetchCallData() {
    try {
      setLoading(true);
      const response = await fetch(`/api/calls/${id}`);
      const data = await response.json();

      if (data.success) {
        setCall(data.data.call);
        setTranscript(data.data.transcript);
        setAnalysis(data.data.analysis);

        // Fetch QA Log entry if available
        try {
          const qaLogResponse = await fetch(`/api/qa-log`);
          const qaLogData = await qaLogResponse.json();
          if (qaLogData.success) {
            const entry = qaLogData.data.entries.find((e: QALogEntry) => e.callId === id);
            if (entry) {
              setQaLogEntry(entry);
            }
          }
        } catch (qaError) {
          console.error('Error fetching QA Log entry:', qaError);
          // Don't fail the whole page if QA Log fetch fails
        }
      } else {
        setError(data.error || 'Failed to load call data');
      }
    } catch (err) {
      setError('Failed to fetch call data');
      console.error('Error fetching call:', err);
    } finally {
      setLoading(false);
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !call) {
    return (
      <div className="space-y-4">
        <Link href="/calls">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Calls
          </Button>
        </Link>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Call</CardTitle>
            <CardDescription>{error || 'Call not found'}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const dimensionLabels = {
    rapport: 'Rapport Building',
    needsDiscovery: 'Needs Discovery',
    productKnowledge: 'Product Knowledge',
    objectionHandling: 'Objection Handling',
    closing: 'Closing Techniques',
    compliance: 'Compliance',
    professionalism: 'Professionalism',
    followUp: 'Follow-Up',
    callOpeningCompliance: 'Call Opening Compliance',
    dataProtectionCompliance: 'Data Protection Compliance',
    mandatoryDisclosures: 'Mandatory Disclosures',
    tcfCompliance: 'TCF Compliance',
    salesProcessCompliance: 'Sales Process Compliance',
    complaintsHandling: 'Complaints Handling',
  };

  // Helper function to generate regulatory reference links
  const getRegulatoryLink = (reference: string): string | null => {
    // GDPR Articles
    if (reference.includes('GDPR Article')) {
      const match = reference.match(/Article (\d+)/i);
      if (match) {
        return `https://gdpr-info.eu/art-${match[1]}-gdpr/`;
      }
    }

    // FCA Handbook sections
    if (reference.includes('ICOBS')) {
      const match = reference.match(/ICOBS ([\d.]+)/i);
      if (match) {
        return `https://www.handbook.fca.org.uk/handbook/ICOBS/${match[1]}.html`;
      }
    }

    if (reference.includes('PRIN')) {
      const match = reference.match(/PRIN (\d+)/i);
      if (match) {
        return `https://www.handbook.fca.org.uk/handbook/PRIN/2/${match[1]}.html`;
      }
    }

    if (reference.includes('DISP')) {
      const match = reference.match(/DISP ([\d.]+)/i);
      if (match) {
        return `https://www.handbook.fca.org.uk/handbook/DISP/${match[1]}.html`;
      }
    }

    if (reference.includes('SYSC')) {
      const match = reference.match(/SYSC ([\d.]+)/i);
      if (match) {
        return `https://www.handbook.fca.org.uk/handbook/SYSC/${match[1]}.html`;
      }
    }

    // DPA 2018
    if (reference.includes('DPA 2018')) {
      return 'https://www.legislation.gov.uk/ukpga/2018/12/contents';
    }

    // IDD
    if (reference.includes('IDD')) {
      return 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016L0097';
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/calls">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{call.filename}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {call.agentName && (
              <div className="flex items-center gap-2">
                <AgentAvatar agentName={call.agentName} agentId={call.agentId} size="sm" />
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {call.agentName} {call.agentId && `(${call.agentId})`}
                </span>
              </div>
            )}
            {call.duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {Math.floor(call.duration / 60)}:{(Math.floor(call.duration % 60)).toString().padStart(2, '0')}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {/* Export buttons */}
          {analysis && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportCallToPDF(call, analysis, qaLogEntry || undefined)}
              >
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportCallToCSV(call, analysis, qaLogEntry || undefined)}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </>
          )}
          {/* Show re-transcribe button if language is not English */}
          {transcript && transcript.language && transcript.language !== 'english' && transcript.language !== 'en' && (
            <Button
              variant="outline"
              onClick={async () => {
                if (confirm(`This call was transcribed as "${transcript.language}". Re-transcribe as English?`)) {
                  try {
                    // Update call status to pending to trigger re-transcription
                    await fetch(`/api/transcribe`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ callId: id }),
                    });
                    alert('Re-transcription started. Refresh the page in a few minutes.');
                  } catch (err) {
                    alert('Failed to start re-transcription');
                  }
                }
              }}
            >
              Re-transcribe as English
            </Button>
          )}
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Audio Player */}
      {call.filename && (
        <div id="audio-player">
          <AudioPlayer ref={audioPlayerRef} audioUrl={`/api/audio/${id}`} />
        </div>
      )}

      {/* Overall Score */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Overall Score
            </CardTitle>
            <CardDescription>
              Weighted average: 70% QA Performance + 30% Compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className={`text-5xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                {analysis.overallScore.toFixed(1)}
                <span className="text-2xl text-muted-foreground">/10</span>
              </div>
              <div className="flex-1">
                <Progress value={analysis.overallScore * 10} className={`h-3 ${getProgressColor(analysis.overallScore)}`} />
              </div>
              <Badge variant={getScoreVariant(analysis.overallScore)} className="text-lg px-4 py-2">
                {getScoreLabel(analysis.overallScore)}
              </Badge>
            </div>
            {/* Show breakdown if available */}
            {analysis.qaScore !== undefined && analysis.complianceScore !== undefined && (
              <div className="mt-4 flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">QA Score:</span>
                  <Badge variant="outline">{analysis.qaScore.toFixed(1)}/10</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Compliance Score:</span>
                  <Badge variant="outline">{analysis.complianceScore.toFixed(1)}/10</Badge>
                </div>
              </div>
            )}
            {analysis.summary && (
              <p className="mt-4 text-muted-foreground">{analysis.summary}</p>
            )}
            {analysis.callType && (
              <div className="mt-4 flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  Call Type: {analysis.callType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </div>
            )}
            {analysis.callOutcome && (
              <div className="mt-4 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-medium">Outcome:</span>
                <span>{analysis.callOutcome}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* QA Dimension Scores */}
      {analysis && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Core QA Dimension Scores</CardTitle>
                <CardDescription>Click any dimension to see details and evidence from the call</CardDescription>
              </div>
              {analysis.qaScore !== undefined && (
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  QA Score: {analysis.qaScore.toFixed(1)}/10
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analysis.scores)
                .filter(([key]) => !['compliance', 'callOpeningCompliance', 'dataProtectionCompliance', 'mandatoryDisclosures', 'tcfCompliance', 'salesProcessCompliance', 'complaintsHandling'].includes(key))
                .map(([key, score]) => {
                const isExpanded = expandedDimensions[key];
                const dimensionLabel = dimensionLabels[key as keyof typeof dimensionLabels];

                // Filter key moments for this dimension
                const relevantMoments = analysis.keyMoments.filter(
                  (moment) => moment.category === key
                );

                return (
                  <Collapsible
                    key={key}
                    open={isExpanded}
                    onOpenChange={(open) =>
                      setExpandedDimensions((prev) => ({ ...prev, [key]: open }))
                    }
                  >
                    <div className="rounded-lg border p-4 space-y-3">
                      {/* Dimension Header with Score */}
                      <CollapsibleTrigger asChild>
                        <button className="w-full flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity">
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            )}
                            <span className="font-medium text-left">{dimensionLabel}</span>
                          </div>
                          <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                            {score.toFixed(1)}/10
                          </span>
                        </button>
                      </CollapsibleTrigger>

                      {/* Progress Bar */}
                      <Progress value={score * 10} className={`h-2 ${getProgressColor(score)}`} />

                      {/* Expanded Content */}
                      <CollapsibleContent className="space-y-4 pt-3">
                        <Separator />

                        {/* Performance Summary */}
                        <div className="flex items-start gap-2">
                          <Badge variant={getScoreVariant(score)} className="mt-0.5">
                            {getScoreLabel(score)}
                          </Badge>
                          <p className="text-sm text-muted-foreground flex-1">
                            {score >= 8
                              ? `Strong performance in ${dimensionLabel.toLowerCase()}`
                              : score >= 6
                              ? `Good performance with room for improvement`
                              : score >= 4
                              ? `This area needs attention and coaching`
                              : `Requires immediate action and focused training`}
                          </p>
                        </div>

                        {/* Key Evidence */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Key Evidence from Call
                          </h4>
                          {relevantMoments.length > 0 ? (
                            <div className="space-y-2">
                              {relevantMoments.map((moment, idx) => {
                                const typeConfig = {
                                  positive: { bg: 'bg-green-50 dark:bg-green-950/30', icon: '✓', color: 'text-green-700 dark:text-green-300' },
                                  negative: { bg: 'bg-red-50 dark:bg-red-950/30', icon: '✗', color: 'text-red-700 dark:text-red-300' },
                                  neutral: { bg: 'bg-gray-50 dark:bg-gray-900/30', icon: '○', color: 'text-gray-700 dark:text-gray-300' },
                                };
                                const config = typeConfig[moment.type];

                                return (
                                  <div key={idx} className={`p-3 rounded ${config.bg} border`}>
                                    <div className="flex items-start gap-2">
                                      <button
                                        onClick={() => handleTimestampClick(moment.timestamp)}
                                        className="font-mono text-xs font-semibold hover:underline cursor-pointer text-blue-600 dark:text-blue-400 transition-colors"
                                        title="Click to jump to this moment in the audio"
                                      >
                                        {Math.floor(moment.timestamp / 60)}:{(Math.floor(moment.timestamp % 60)).toString().padStart(2, '0')}
                                      </button>
                                      <span className={`font-bold ${config.color}`}>{config.icon}</span>
                                      <div className="flex-1">
                                        <p className="text-xs text-muted-foreground mb-1">{moment.description}</p>
                                        <p className="text-sm italic">"{moment.quote}"</p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground italic p-3 bg-muted/50 rounded border">
                              No specific key moments were identified for {dimensionLabel.toLowerCase()} in this call.
                              {score >= 8 && " This dimension received a high score based on overall performance throughout the call."}
                              {score < 8 && score >= 6 && " Review the full transcript for examples related to this dimension."}
                              {score < 6 && " This area may need improvement - consider targeted coaching."}
                            </p>
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* UK Compliance Dimensions */}
      {analysis && (
        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🇬🇧</span>
                  UK Compliance Dimensions
                </CardTitle>
                <CardDescription>Regulatory compliance scores based on FCA, ICOBS, GDPR, and IDD requirements</CardDescription>
              </div>
              {analysis.complianceScore !== undefined && (
                <Badge variant="secondary" className="text-lg px-4 py-2 bg-blue-100 dark:bg-blue-900">
                  Compliance Score: {analysis.complianceScore.toFixed(1)}/10
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {Object.entries(analysis.scores)
                .filter(([key]) => ['callOpeningCompliance', 'dataProtectionCompliance', 'mandatoryDisclosures', 'tcfCompliance', 'salesProcessCompliance', 'complaintsHandling'].includes(key))
                .map(([key, score]) => {
                // Handle nullable scores
                if (score === null) {
                  return (
                    <div key={key} className="rounded-lg border border-dashed p-4 bg-muted/50">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-muted-foreground">
                          {dimensionLabels[key as keyof typeof dimensionLabels]}
                        </span>
                        <Badge variant="outline" className="text-muted-foreground">N/A</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Not applicable for this call type
                      </p>
                    </div>
                  );
                }

                const isExpanded = expandedDimensions[key];
                const dimensionLabel = dimensionLabels[key as keyof typeof dimensionLabels];

                // Filter key moments for this dimension
                const relevantMoments = analysis.keyMoments.filter(
                  (moment) => moment.category === key
                );

                return (
                  <Collapsible
                    key={key}
                    open={isExpanded}
                    onOpenChange={(open) =>
                      setExpandedDimensions((prev) => ({ ...prev, [key]: open }))
                    }
                  >
                    <div className="rounded-lg border p-4 space-y-3 bg-white dark:bg-gray-950">
                      {/* Dimension Header with Score */}
                      <CollapsibleTrigger asChild>
                        <button className="w-full flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity">
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            )}
                            <span className="font-medium text-left">{dimensionLabel}</span>
                          </div>
                          <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                            {score.toFixed(1)}/10
                          </span>
                        </button>
                      </CollapsibleTrigger>

                      {/* Progress Bar */}
                      <Progress value={score * 10} className={`h-2 ${getProgressColor(score)}`} />

                      {/* Expanded Content */}
                      <CollapsibleContent className="space-y-4 pt-3">
                        <Separator />

                        {/* Performance Summary */}
                        <div className="flex items-start gap-2">
                          <Badge variant={getScoreVariant(score)} className="mt-0.5">
                            {getScoreLabel(score)}
                          </Badge>
                          <p className="text-sm text-muted-foreground flex-1">
                            {score >= 8
                              ? `Strong compliance in ${dimensionLabel.toLowerCase()}`
                              : score >= 6
                              ? `Acceptable compliance with room for improvement`
                              : score >= 4
                              ? `Compliance issues detected - requires attention`
                              : `Critical compliance failures - immediate action required`}
                          </p>
                        </div>

                        {/* Key Evidence */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Key Evidence from Call
                          </h4>
                          {relevantMoments.length > 0 ? (
                            <div className="space-y-2">
                              {relevantMoments.map((moment, idx) => {
                                const typeConfig = {
                                  positive: { bg: 'bg-green-50 dark:bg-green-950/30', icon: '✓', color: 'text-green-700 dark:text-green-300' },
                                  negative: { bg: 'bg-red-50 dark:bg-red-950/30', icon: '✗', color: 'text-red-700 dark:text-red-300' },
                                  neutral: { bg: 'bg-gray-50 dark:bg-gray-900/30', icon: '○', color: 'text-gray-700 dark:text-gray-300' },
                                };
                                const config = typeConfig[moment.type];

                                return (
                                  <div key={idx} className={`p-3 rounded ${config.bg} border`}>
                                    <div className="flex items-start gap-2">
                                      <button
                                        onClick={() => handleTimestampClick(moment.timestamp)}
                                        className="font-mono text-xs font-semibold hover:underline cursor-pointer text-blue-600 dark:text-blue-400 transition-colors"
                                        title="Click to jump to this moment in the audio"
                                      >
                                        {Math.floor(moment.timestamp / 60)}:{(Math.floor(moment.timestamp % 60)).toString().padStart(2, '0')}
                                      </button>
                                      <span className={`font-bold ${config.color}`}>{config.icon}</span>
                                      <div className="flex-1">
                                        <p className="text-xs text-muted-foreground mb-1">{moment.description}</p>
                                        <p className="text-sm italic">"{moment.quote}"</p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground italic p-3 bg-muted/50 rounded border">
                              No specific key moments were identified for {dimensionLabel.toLowerCase()} in this call.
                              {score >= 8 && " This dimension received a high compliance score based on overall performance throughout the call."}
                              {score < 8 && score >= 6 && " Review the full transcript for examples related to this compliance area."}
                              {score < 6 && " This area has compliance issues - review the Compliance Issues section below for details."}
                            </p>
                          )}
                        </div>

                        {/* Compliance Issues for this Dimension */}
                        {analysis.complianceIssues && analysis.complianceIssues.length > 0 && (() => {
                          const relevantIssues = analysis.complianceIssues.filter((issue) => {
                            const isObject = typeof issue === 'object' && issue !== null;
                            const issueObj = isObject ? issue : { issue: issue, severity: 'medium', category: 'general' };
                            return issueObj.category === key;
                          });

                          if (relevantIssues.length === 0) return null;

                          return (
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                                Compliance Issues
                              </h4>
                              <div className="space-y-2">
                                {relevantIssues.map((issue, idx) => {
                                  const isObject = typeof issue === 'object' && issue !== null;
                                  const issueObj = isObject ? issue : { issue: issue, severity: 'medium', category: 'general', regulatoryReference: '', timestamp: null, remediation: '' };

                                  const severityConfig = {
                                    critical: { emoji: '⚠️', badge: 'bg-red-600 text-white', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-900' },
                                    high: { emoji: '🟠', badge: 'bg-orange-600 text-white', bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-900' },
                                    medium: { emoji: 'ℹ️', badge: 'bg-yellow-600 text-white', bg: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-200 dark:border-yellow-900' },
                                    low: { emoji: '✓', badge: 'bg-green-600 text-white', bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-900' },
                                  };

                                  const config = severityConfig[issueObj.severity as keyof typeof severityConfig] || severityConfig.medium;

                                  return (
                                    <div key={idx} className={`p-3 rounded border ${config.bg} ${config.border}`}>
                                      <div className="flex items-start gap-2">
                                        <span className="text-lg">{config.emoji}</span>
                                        <div className="flex-1 space-y-2">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <Badge className={`text-xs uppercase font-bold ${config.badge}`}>
                                              {issueObj.severity}
                                            </Badge>
                                            {issueObj.timestamp !== null && issueObj.timestamp !== undefined && (
                                              <button
                                                onClick={() => handleTimestampClick(issueObj.timestamp!)}
                                                className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                                                title="Click to jump to this moment"
                                              >
                                                {Math.floor(issueObj.timestamp / 60)}:{(Math.floor(issueObj.timestamp % 60)).toString().padStart(2, '0')}
                                              </button>
                                            )}
                                          </div>
                                          <p className="text-sm">{issueObj.issue}</p>
                                          {issueObj.regulatoryReference && (
                                            <div className="text-xs">
                                              <span className="font-semibold text-muted-foreground">Reference: </span>
                                              {(() => {
                                                const link = getRegulatoryLink(issueObj.regulatoryReference);
                                                return link ? (
                                                  <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
                                                    {issueObj.regulatoryReference} <ExternalLink className="h-3 w-3" />
                                                  </a>
                                                ) : (
                                                  <span className="text-muted-foreground">{issueObj.regulatoryReference}</span>
                                                );
                                              })()}
                                            </div>
                                          )}
                                          {issueObj.remediation && (
                                            <div className="pt-2 border-t border-current/20">
                                              <p className="text-xs font-semibold text-muted-foreground">Remediation:</p>
                                              <p className="text-xs mt-1">{issueObj.remediation}</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Coaching Recommendations */}
      {analysis && analysis.coachingRecommendations.length > 0 && (() => {
        // Get compliance issues for categorization
        const criticalIssues = analysis.complianceIssues?.filter((issue: any) =>
          issue.severity === 'critical' || issue.severity === 'high'
        ) || [];

        // Categorize coaching recommendations
        const strengths: string[] = [];
        const improvements: string[] = [];
        const critical: string[] = [];

        analysis.coachingRecommendations.forEach((rec: string) => {
          const lowerRec = rec.toLowerCase();

          // Critical: mentions compliance, regulatory, GDPR, FCA, disclosure, etc.
          if (lowerRec.includes('must') || lowerRec.includes('critical') || lowerRec.includes('compliance') ||
              lowerRec.includes('regulatory') || lowerRec.includes('gdpr') || lowerRec.includes('fca') ||
              lowerRec.includes('disclosure') || lowerRec.includes('call recording') || lowerRec.includes('data protection')) {
            critical.push(rec);
          }
          // Strengths: high scores (9→10), excellent, strong, great rapport, etc.
          else if (lowerRec.includes('→10') || lowerRec.includes('excellent') || lowerRec.includes('strong') ||
                   lowerRec.includes('exceptional') || lowerRec.includes('9→10') || lowerRec.includes('10/10')) {
            strengths.push(rec);
          }
          // Everything else is improvement
          else {
            improvements.push(rec);
          }
        });

        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Coaching Feedback for {call.agentName}
              </CardTitle>
              <CardDescription>
                Personalized coaching insights to help you grow and maintain compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Strengths Section */}
              {strengths.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✅</span>
                    <h3 className="text-base font-bold text-green-700 dark:text-green-400">Strengths - What You Did Well</h3>
                  </div>
                  <div className="pl-7 space-y-2 bg-green-50/50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900">
                    {strengths.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                        <span className="flex-1 text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Areas for Improvement */}
              {improvements.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📈</span>
                    <h3 className="text-base font-bold text-blue-700 dark:text-blue-400">Areas for Improvement</h3>
                  </div>
                  <div className="pl-7 space-y-2 bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
                    {improvements.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                        <span className="flex-1 text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Critical Compliance Issues */}
              {critical.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⚠️</span>
                    <h3 className="text-base font-bold text-red-700 dark:text-red-400">Critical Compliance Issues - Requires Immediate Attention</h3>
                  </div>
                  <div className="pl-7 space-y-3 bg-red-50/50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-900">
                    {critical.map((rec, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                          <span className="flex-1 text-sm font-medium">{rec}</span>
                        </div>
                        {/* Add business context for critical items */}
                        {rec.toLowerCase().includes('call recording') && (
                          <p className="text-xs text-muted-foreground pl-3 italic border-l-2 border-red-300 dark:border-red-800 ml-2">
                            📘 Why this matters: FCA requires call recording disclosure (SYSC 9.3.2R) to maintain our regulatory authorization. Non-compliance can result in enforcement action and reputational damage.
                          </p>
                        )}
                        {rec.toLowerCase().includes('data protection') && (
                          <p className="text-xs text-muted-foreground pl-3 italic border-l-2 border-red-300 dark:border-red-800 ml-2">
                            📘 Why this matters: GDPR Article 13 requires clear privacy notices. Data protection failures can lead to ICO fines up to £17.5M and customer trust erosion.
                          </p>
                        )}
                        {(rec.toLowerCase().includes('disclosure') || rec.toLowerCase().includes('fca')) && (
                          <p className="text-xs text-muted-foreground pl-3 italic border-l-2 border-red-300 dark:border-red-800 ml-2">
                            📘 Why this matters: FCA mandatory disclosures (firm identity, regulatory status, fees) are required by ICOBS 4.2.1R. Missing disclosures can invalidate insurance contracts and expose Pikl to regulatory sanctions.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}


      {/* Transcript */}
      {transcript && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Transcript
            </CardTitle>
            <CardDescription>
              Full conversation transcript with speaker identification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 font-mono text-sm">
              {transcript.turns.map((turn, idx) => (
                <div key={idx} className="flex gap-3">
                  <button
                    onClick={() => handleTimestampClick(turn.timestamp)}
                    className="flex-shrink-0 w-24 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:underline cursor-pointer transition-colors"
                    title="Click to jump to this moment in the audio"
                  >
                    [{Math.floor(turn.timestamp / 60)}:{(Math.floor(turn.timestamp % 60)).toString().padStart(2, '0')}]
                  </button>
                  <div className="flex-1">
                    <span className={`font-bold ${turn.speaker === 'agent' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}`}>
                      {turn.speaker === 'agent' ? 'AGENT' : 'CUSTOMER'}:
                    </span>{' '}
                    {turn.text}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
