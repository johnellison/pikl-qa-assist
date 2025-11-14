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
    professionalism: number;
    followUp: number;
  };
  complianceDimensionScores: {
    callOpeningCompliance: number;
    dataProtectionCompliance: number;
    mandatoryDisclosures: number;
    tcfCompliance: number;
    salesProcessCompliance: number;
    complaintsHandling: number;
  };
  callTypeCounts: {
    new_business_sales: number;
    renewals: number;
    mid_term_adjustment: number;
    claims_inquiry: number;
    complaints: number;
    general_inquiry: number;
  };
  complianceIssues: {
    critical: number;
    high: number;
    medium: number;
    low: number;
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
                professionalism: 0,
                followUp: 0,
              },
              complianceDimensionScores: {
                callOpeningCompliance: 0,
                dataProtectionCompliance: 0,
                mandatoryDisclosures: 0,
                tcfCompliance: 0,
                salesProcessCompliance: 0,
                complaintsHandling: 0,
              },
              callTypeCounts: {
                new_business_sales: 0,
                renewals: 0,
                mid_term_adjustment: 0,
                claims_inquiry: 0,
                complaints: 0,
                general_inquiry: 0,
              },
              complianceIssues: {
                critical: 0,
                high: 0,
                medium: 0,
                low: 0,
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
              professionalism: 0,
              followUp: 0,
            };

            const complianceDimensionTotals = {
              callOpeningCompliance: 0,
              dataProtectionCompliance: 0,
              mandatoryDisclosures: 0,
              tcfCompliance: 0,
              salesProcessCompliance: 0,
              complaintsHandling: 0,
            };

            const complianceDimensionCounts = {
              callOpeningCompliance: 0,
              dataProtectionCompliance: 0,
              mandatoryDisclosures: 0,
              tcfCompliance: 0,
              salesProcessCompliance: 0,
              complaintsHandling: 0,
            };

            // Fetch analysis for each completed call
            for (const call of agentCalls) {
              // Count call types from call data (don't need analysis for this)
              const callType = call.callType || 'general_inquiry';
              if (agent.callTypeCounts[callType as keyof typeof agent.callTypeCounts] !== undefined) {
                agent.callTypeCounts[callType as keyof typeof agent.callTypeCounts]++;
              }

              try {
                const callResponse = await fetch(`/api/calls/${call.id}`);
                const callData = await callResponse.json();

                if (callData.success && callData.data.analysis) {
                  const analysis = callData.data.analysis;
                  totalScore += analysis.overallScore;

                  // Aggregate dimension scores (without deprecated compliance field)
                  if (analysis.scores) {
                    dimensionTotals.rapport += analysis.scores.rapport || 0;
                    dimensionTotals.needsDiscovery += analysis.scores.needsDiscovery || 0;
                    dimensionTotals.productKnowledge += analysis.scores.productKnowledge || 0;
                    dimensionTotals.objectionHandling += analysis.scores.objectionHandling || 0;
                    dimensionTotals.closing += analysis.scores.closing || 0;
                    dimensionTotals.professionalism += analysis.scores.professionalism || 0;
                    dimensionTotals.followUp += analysis.scores.followUp || 0;
                  }

                  // Aggregate UK compliance dimension scores (handle nulls)
                  Object.keys(complianceDimensionTotals).forEach((key) => {
                    const score = analysis.scores[key as keyof typeof analysis.scores];
                    if (score !== null && score !== undefined) {
                      complianceDimensionTotals[key as keyof typeof complianceDimensionTotals] += score;
                      complianceDimensionCounts[key as keyof typeof complianceDimensionCounts]++;
                    }
                  });

                  // Count compliance issues by severity
                  if (analysis.complianceIssues && Array.isArray(analysis.complianceIssues)) {
                    analysis.complianceIssues.forEach((issue: any) => {
                      const severity = issue.severity || 'medium';
                      if (agent.complianceIssues[severity as keyof typeof agent.complianceIssues] !== undefined) {
                        agent.complianceIssues[severity as keyof typeof agent.complianceIssues]++;
                      }
                    });
                  }
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

            // Calculate average UK compliance dimension scores
            Object.keys(complianceDimensionTotals).forEach((key) => {
              const count = complianceDimensionCounts[key as keyof typeof complianceDimensionCounts];
              agent.complianceDimensionScores[key as keyof typeof complianceDimensionTotals] =
                count > 0 ? complianceDimensionTotals[key as keyof typeof complianceDimensionTotals] / count : 0;
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

              {/* Call Type Tally */}
              {agent.completedCalls > 0 && (() => {
                const types = [
                  { key: 'new_business_sales', icon: '💼', label: 'Sales' },
                  { key: 'renewals', icon: '🔄', label: 'Renewals' },
                  { key: 'mid_term_adjustment', icon: '📝', label: 'MTAs' },
                  { key: 'claims_inquiry', icon: '🛡️', label: 'Claims' },
                  { key: 'complaints', icon: '⚠️', label: 'Complaints' },
                  { key: 'general_inquiry', icon: '💬', label: 'Inquiries' },
                ];

                const activeCalls = types.filter(t => agent.callTypeCounts[t.key as keyof typeof agent.callTypeCounts] > 0);

                if (activeCalls.length === 0) return null;

                return (
                  <div className="pt-3 border-t">
                    <div className="text-xs text-muted-foreground mb-2">Call Types</div>
                    <div className="grid grid-cols-2 gap-2">
                      {activeCalls.map((type) => (
                        <div key={type.key} className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>{type.icon}</span>
                            {type.label}
                          </div>
                          <div className="text-lg font-semibold">{agent.callTypeCounts[type.key as keyof typeof agent.callTypeCounts]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Compliance Issues Breakdown */}
              {agent.completedCalls > 0 && (() => {
                const totalIssues = agent.complianceIssues.critical + agent.complianceIssues.high +
                                   agent.complianceIssues.medium + agent.complianceIssues.low;

                if (totalIssues === 0) return null;

                const issues = [
                  { key: 'critical', label: 'Critical', count: agent.complianceIssues.critical, color: 'text-red-600' },
                  { key: 'high', label: 'High', count: agent.complianceIssues.high, color: 'text-orange-600' },
                  { key: 'medium', label: 'Medium', count: agent.complianceIssues.medium, color: 'text-amber-600' },
                  { key: 'low', label: 'Low', count: agent.complianceIssues.low, color: 'text-blue-600' },
                ].filter(issue => issue.count > 0);

                return (
                  <div className="pt-3 border-t">
                    <div className="text-xs text-muted-foreground mb-2">Compliance Issues</div>
                    <div className="grid grid-cols-2 gap-2">
                      {issues.map((issue) => (
                        <div key={issue.key} className="space-y-1">
                          <div className="text-xs text-muted-foreground">
                            {issue.label}
                          </div>
                          <div className={`text-lg font-semibold ${issue.color}`}>{issue.count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

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

      {/* Team Breakdown */}
      {agents.length > 0 && agents.some(a => a.completedCalls > 0) && (() => {
        // Calculate team averages across all agents with completed calls
        const agentsWithData = agents.filter(a => a.completedCalls > 0);
        const teamAverages = {
          rapport: 0,
          needsDiscovery: 0,
          productKnowledge: 0,
          objectionHandling: 0,
          closing: 0,
          professionalism: 0,
          followUp: 0,
        };

        const teamComplianceAverages = {
          callOpeningCompliance: 0,
          dataProtectionCompliance: 0,
          mandatoryDisclosures: 0,
          tcfCompliance: 0,
          salesProcessCompliance: 0,
          complaintsHandling: 0,
        };

        agentsWithData.forEach(agent => {
          teamAverages.rapport += agent.dimensionScores.rapport;
          teamAverages.needsDiscovery += agent.dimensionScores.needsDiscovery;
          teamAverages.productKnowledge += agent.dimensionScores.productKnowledge;
          teamAverages.objectionHandling += agent.dimensionScores.objectionHandling;
          teamAverages.closing += agent.dimensionScores.closing;
          teamAverages.professionalism += agent.dimensionScores.professionalism;
          teamAverages.followUp += agent.dimensionScores.followUp;

          Object.keys(teamComplianceAverages).forEach(key => {
            teamComplianceAverages[key as keyof typeof teamComplianceAverages] +=
              agent.complianceDimensionScores[key as keyof typeof agent.complianceDimensionScores];
          });
        });

        Object.keys(teamAverages).forEach(key => {
          teamAverages[key as keyof typeof teamAverages] /= agentsWithData.length;
        });

        Object.keys(teamComplianceAverages).forEach(key => {
          teamComplianceAverages[key as keyof typeof teamComplianceAverages] /= agentsWithData.length;
        });

        const qaLabels: Record<string, string> = {
          rapport: 'Rapport Building',
          needsDiscovery: 'Needs Discovery',
          productKnowledge: 'Product Knowledge',
          objectionHandling: 'Objection Handling',
          closing: 'Closing Techniques',
          professionalism: 'Professionalism',
          followUp: 'Follow-Up',
        };

        const complianceLabels: Record<string, string> = {
          callOpeningCompliance: 'Call Opening Compliance',
          dataProtectionCompliance: 'Data Protection Compliance',
          mandatoryDisclosures: 'Mandatory Disclosures',
          tcfCompliance: 'TCF Compliance',
          salesProcessCompliance: 'Sales Process Compliance',
          complaintsHandling: 'Complaints Handling',
        };

        return (
          <Card>
            <CardHeader>
              <CardTitle>Team Breakdown</CardTitle>
              <CardDescription>
                Average scores across all {agentsWithData.length} agent{agentsWithData.length > 1 ? 's' : ''} with completed analyses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* General QA Dimensions */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">General QA Dimensions</h3>
                <div className="space-y-3">
                  {Object.entries(teamAverages).map(([key, score]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{qaLabels[key]}</span>
                        <span className={`font-bold ${getScoreColor(score)}`}>
                          {score.toFixed(1)}/10
                        </span>
                      </div>
                      <Progress value={score * 10} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              {/* UK Compliance Dimensions */}
              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">UK Compliance Dimensions</h3>
                <div className="space-y-3">
                  {Object.entries(teamComplianceAverages).map(([key, score]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{complianceLabels[key]}</span>
                        <span className={`font-bold ${getScoreColor(score)}`}>
                          {score.toFixed(1)}/10
                        </span>
                      </div>
                      <Progress value={score * 10} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })()}
    </div>
  );
}
