'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, Phone, Award, Loader2 } from 'lucide-react';
import type { Call } from '@/types';
import { getScoreColor, getScoreLabel, getScoreVariant } from '@/lib/score-utils';
import { AgentAvatar } from '@/components/agent-avatar';

interface AgentStats {
  agentId: string;
  agentName: string;
  totalCalls: number;
  completedCalls: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  lastCallDate: Date;
  dimensionScores: {
    rapport: number;
    needsDiscovery: number;
    productKnowledge: number;
    objectionHandling: number;
    closing: number;
    compliance: number;
    professionalism: number;
    followUp: number;
  };
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  async function fetchAgents() {
    try {
      setLoading(true);
      const response = await fetch('/api/calls');
      const data = await response.json();

      if (data.success) {
        const agentMap = new Map<string, AgentStats>();

        // Process each call
        data.data.calls.forEach((call: Call) => {
          if (!call.agentId && !call.agentName) return;

          const agentKey = call.agentId || call.agentName || 'unknown';

          if (!agentMap.has(agentKey)) {
            agentMap.set(agentKey, {
              agentId: call.agentId || '',
              agentName: call.agentName || 'Unknown Agent',
              totalCalls: 0,
              completedCalls: 0,
              averageScore: 0,
              bestScore: 0,
              worstScore: 10,
              lastCallDate: call.createdAt,
              dimensionScores: {
                rapport: 0,
                needsDiscovery: 0,
                productKnowledge: 0,
                objectionHandling: 0,
                closing: 0,
                compliance: 0,
                professionalism: 0,
                followUp: 0,
              },
            });
          }

          const agent = agentMap.get(agentKey)!;
          agent.totalCalls++;

          if (call.status === 'complete' && call.overallScore) {
            agent.completedCalls++;
            agent.bestScore = Math.max(agent.bestScore, call.overallScore);
            agent.worstScore = Math.min(agent.worstScore, call.overallScore);
          }

          // Update last call date
          if (new Date(call.createdAt) > new Date(agent.lastCallDate)) {
            agent.lastCallDate = call.createdAt;
          }
        });

        // Fetch detailed analysis for completed calls
        const agentsArray = Array.from(agentMap.values());

        for (const agent of agentsArray) {
          const agentCalls = data.data.calls.filter(
            (call: Call) =>
              (call.agentId === agent.agentId || call.agentName === agent.agentName) &&
              call.status === 'complete'
          );

          if (agentCalls.length > 0) {
            let totalScore = 0;
            const dimensionTotals = {
              rapport: 0,
              needsDiscovery: 0,
              productKnowledge: 0,
              objectionHandling: 0,
              closing: 0,
              compliance: 0,
              professionalism: 0,
              followUp: 0,
            };

            // Fetch analysis for each completed call
            for (const call of agentCalls) {
              try {
                const callResponse = await fetch(`/api/calls/${call.id}`);
                const callData = await callResponse.json();

                if (callData.success && callData.data.analysis) {
                  const analysis = callData.data.analysis;
                  totalScore += analysis.overallScore;

                  // Aggregate dimension scores
                  Object.keys(dimensionTotals).forEach((key) => {
                    dimensionTotals[key as keyof typeof dimensionTotals] +=
                      analysis.scores[key as keyof typeof analysis.scores] || 0;
                  });
                }
              } catch (err) {
                console.error(`Error fetching call ${call.id}:`, err);
              }
            }

            agent.averageScore = totalScore / agentCalls.length;

            // Calculate average dimension scores
            Object.keys(dimensionTotals).forEach((key) => {
              agent.dimensionScores[key as keyof typeof dimensionTotals] =
                dimensionTotals[key as keyof typeof dimensionTotals] / agentCalls.length;
            });
          }
        }

        // Sort by average score descending
        agentsArray.sort((a, b) => b.averageScore - a.averageScore);
        setAgents(agentsArray);
      } else {
        setError(data.error || 'Failed to load agents');
      }
    } catch (err) {
      setError('Failed to fetch agents');
      console.error('Error fetching agents:', err);
    } finally {
      setLoading(false);
    }
  }

  function getPerformanceBadge(score: number) {
    return <Badge variant={getScoreVariant(score)}>{getScoreLabel(score)}</Badge>;
  }

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Agents</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchAgents}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  if (agents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Agents Yet</CardTitle>
          <CardDescription>
            Upload call recordings to start tracking agent performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/upload">
            <Button>Upload Call Recording</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Performance</h1>
          <p className="text-muted-foreground mt-2">
            View QA scores and statistics for all agents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg">
            <Users className="mr-2 h-4 w-4" />
            {agents.length} Agents
          </Badge>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Card key={agent.agentId || agent.agentName} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <AgentAvatar agentName={agent.agentName} agentId={agent.agentId} size="md" />
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{agent.agentName}</CardTitle>
                    {agent.agentId && (
                      <CardDescription>ID: {agent.agentId}</CardDescription>
                    )}
                  </div>
                </div>
                {agent.completedCalls > 0 && getPerformanceBadge(agent.averageScore)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Average Score */}
              {agent.completedCalls > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Average Score</span>
                    <span className={`text-2xl font-bold ${getScoreColor(agent.averageScore)}`}>
                      {agent.averageScore.toFixed(1)}/10
                    </span>
                  </div>
                  <Progress value={agent.averageScore * 10} className="h-2" />
                </div>
              ) : (
                <div className="text-center text-muted-foreground text-sm">
                  No completed analyses yet
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    Total Calls
                  </div>
                  <div className="text-lg font-semibold">{agent.totalCalls}</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    Analyzed
                  </div>
                  <div className="text-lg font-semibold">{agent.completedCalls}</div>
                </div>

                {agent.completedCalls > 0 && (
                  <>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Award className="h-3 w-3" />
                        Best Score
                      </div>
                      <div className="text-lg font-semibold text-green-600">
                        {agent.bestScore.toFixed(1)}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Last Call</div>
                      <div className="text-sm font-medium">
                        {formatDate(agent.lastCallDate)}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* View Details Button */}
              <Link href={`/calls?agentId=${agent.agentId || agent.agentName}`}>
                <Button variant="outline" className="w-full mt-2">
                  View Calls
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Dimensions */}
      {agents.length > 0 && agents[0].completedCalls > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performer Breakdown</CardTitle>
            <CardDescription>
              Dimensional scores for {agents[0].agentName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(agents[0].dimensionScores).map(([key, score]) => {
                const labels: Record<string, string> = {
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
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{labels[key]}</span>
                      <span className={`font-bold ${getScoreColor(score)}`}>
                        {score.toFixed(1)}/10
                      </span>
                    </div>
                    <Progress value={score * 10} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
