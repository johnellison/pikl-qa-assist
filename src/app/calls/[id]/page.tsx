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
} from 'lucide-react';
import type { Call, Transcript, Analysis } from '@/types';
import { getScoreColor, getScoreBgColor, getScoreLabel, getScoreVariant, getProgressColor } from '@/lib/score-utils';
import { AgentAvatar } from '@/components/agent-avatar';
import { AudioPlayer, AudioPlayerRef } from '@/components/audio-player';

export default function CallDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const audioPlayerRef = useRef<AudioPlayerRef>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
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
            {analysis.summary && (
              <p className="mt-4 text-muted-foreground">{analysis.summary}</p>
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
            <CardTitle>QA Dimension Scores</CardTitle>
            <CardDescription>Click any dimension to see details and evidence from the call</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analysis.scores).map(([key, score]) => {
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

                        {/* Coaching Tips (filtered by relevance) */}
                        {analysis.coachingRecommendations.some((rec) =>
                          rec.toLowerCase().includes(dimensionLabel.toLowerCase().split(' ')[0])
                        ) && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                              <Lightbulb className="h-4 w-4" />
                              Coaching Tips
                            </h4>
                            <ul className="space-y-1">
                              {analysis.coachingRecommendations
                                .filter((rec) =>
                                  rec.toLowerCase().includes(dimensionLabel.toLowerCase().split(' ')[0])
                                )
                                .map((rec, idx) => (
                                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-primary mt-0.5">•</span>
                                    <span>{rec}</span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}
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
      {analysis && analysis.coachingRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Coaching Recommendations
            </CardTitle>
            <CardDescription>Actionable feedback for improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.coachingRecommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm flex-shrink-0">
                    {idx + 1}
                  </div>
                  <span className="flex-1">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Compliance Issues */}
      {analysis && analysis.complianceIssues && analysis.complianceIssues.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Compliance Issues
            </CardTitle>
            <CardDescription>Critical compliance violations detected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.complianceIssues.map((issue, idx) => {
                // Handle both string format (legacy) and object format (new)
                const isObject = typeof issue === 'object' && issue !== null;
                const description = isObject ? (issue as any).description : issue;
                const severity = isObject ? (issue as any).severity : undefined;
                const timestamp = isObject ? (issue as any).timestamp : undefined;

                return (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                    <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0 text-destructive" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {severity && (
                          <Badge
                            variant={severity === 'critical' ? 'destructive' : 'secondary'}
                            className="text-xs uppercase"
                          >
                            {severity}
                          </Badge>
                        )}
                        {timestamp !== undefined && (
                          <Badge variant="outline" className="font-mono text-xs">
                            {Math.floor(timestamp / 60)}:{(Math.floor(timestamp % 60)).toString().padStart(2, '0')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-destructive">{description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Moments */}
      {analysis && analysis.keyMoments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Key Moments</CardTitle>
            <CardDescription>Highlighted moments from the call</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.keyMoments.map((moment, idx) => {
                const typeConfig = {
                  positive: { bg: 'bg-green-100 dark:bg-green-950', text: 'text-green-700 dark:text-green-300', icon: '✅' },
                  negative: { bg: 'bg-red-100 dark:bg-red-950', text: 'text-red-700 dark:text-red-300', icon: '❌' },
                  neutral: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', icon: '➖' },
                };
                const config = typeConfig[moment.type];

                return (
                  <div key={idx} className={`p-4 rounded-lg ${config.bg}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{config.icon}</span>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            {Math.floor(moment.timestamp / 60)}:{(Math.floor(moment.timestamp % 60)).toString().padStart(2, '0')}
                          </Badge>
                          <span className="text-xs uppercase font-semibold tracking-wide">
                            {moment.category}
                          </span>
                        </div>
                        <p className="font-medium">{moment.description}</p>
                        <blockquote className={`border-l-4 border-current pl-3 italic ${config.text}`}>
                          "{moment.quote}"
                        </blockquote>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

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
