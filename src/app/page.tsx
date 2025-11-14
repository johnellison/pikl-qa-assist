'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Upload, TrendingUp, Users, CheckCircle2 } from "lucide-react";

interface KeyInsight {
  topIssues: { category: string; count: number; percentage: number }[];
  strengths: { dimension: string; avgScore: number }[];
  opportunities: { dimension: string; avgScore: number }[];
}

export default function Home() {
  const [stats, setStats] = useState({
    totalCalls: 0,
    analyzedCalls: 0,
    totalStorageBytes: 0,
  });
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [keyInsights, setKeyInsights] = useState<KeyInsight | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const [statsRes, callsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/calls?status=complete'),
      ]);

      const statsData = await statsRes.json();
      const callsData = await callsRes.json();

      if (statsData.success) {
        setStats(statsData.data);
      }

      if (callsData.success && callsData.data.calls.length > 0) {
        const calls = callsData.data.calls;
        const total = calls.reduce((sum: number, call: any) => sum + (call.overallScore || 0), 0);
        setAverageScore(total / calls.length);

        // Fetch analyses for key insights
        const analysesPromises = calls.map(async (call: any) => {
          try {
            const res = await fetch(`/api/calls/${call.id}`);
            if (res.ok) {
              const data = await res.json();
              return data.data?.analysis || null;
            }
          } catch (err) {
            console.error(`Failed to fetch analysis for ${call.id}:`, err);
          }
          return null;
        });

        const analyses = (await Promise.all(analysesPromises)).filter((a: any) => a !== null);

        // Aggregate compliance issues
        const issueCategories: Record<string, number> = {};
        analyses.forEach((analysis: any) => {
          if (analysis.complianceIssues) {
            analysis.complianceIssues.forEach((issue: any) => {
              const category = issue.category || 'general';
              issueCategories[category] = (issueCategories[category] || 0) + 1;
            });
          }
        });

        const topIssues = Object.entries(issueCategories)
          .map(([category, count]) => ({
            category: category.replace(/([A-Z])/g, ' $1').trim(),
            count: count as number,
            percentage: ((count as number) / calls.length) * 100,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Aggregate dimension scores
        const dimensionTotals: Record<string, number> = {
          rapport: 0,
          needsDiscovery: 0,
          productKnowledge: 0,
          objectionHandling: 0,
          closing: 0,
          professionalism: 0,
          followUp: 0,
        };

        analyses.forEach((analysis: any) => {
          if (analysis.scores) {
            dimensionTotals.rapport += analysis.scores.rapport || 0;
            dimensionTotals.needsDiscovery += analysis.scores.needsDiscovery || 0;
            dimensionTotals.productKnowledge += analysis.scores.productKnowledge || 0;
            dimensionTotals.objectionHandling += analysis.scores.objectionHandling || 0;
            dimensionTotals.closing += analysis.scores.closing || 0;
            dimensionTotals.professionalism += analysis.scores.professionalism || 0;
            dimensionTotals.followUp += analysis.scores.followUp || 0;
          }
        });

        const dimensionAverages = Object.entries(dimensionTotals).map(([dimension, total]) => ({
          dimension: dimension.replace(/([A-Z])/g, ' $1').trim(),
          avgScore: total / analyses.length,
        }));

        const strengths = dimensionAverages
          .sort((a, b) => b.avgScore - a.avgScore)
          .slice(0, 3);

        const opportunities = dimensionAverages
          .sort((a, b) => a.avgScore - b.avgScore)
          .slice(0, 3);

        setKeyInsights({ topIssues, strengths, opportunities });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to Pikl QA Assistant - AI-powered call quality analysis
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.totalCalls}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalCalls === 0 ? 'No calls processed yet' : `${stats.analyzedCalls} analyzed`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : averageScore ? `${averageScore.toFixed(1)}/10` : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {averageScore ? 'Across all analyzed calls' : 'Upload calls to see metrics'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analyzed Calls</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.analyzedCalls}</div>
            <p className="text-xs text-muted-foreground">
              {stats.analyzedCalls === 0 ? 'No analysis completed yet' : 'Ready to review'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : formatBytes(stats.totalStorageBytes)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total data stored
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and workflows</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/upload">
              <Button className="w-full" variant="default">
                <Upload className="mr-2 h-4 w-4" />
                Upload New Call
              </Button>
            </Link>
            <Link href="/calls">
              <Button className="w-full" variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                View All Calls
              </Button>
            </Link>
            <Link href="/agents">
              <Button className="w-full" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                View Agents
              </Button>
            </Link>
            <Link href="/analytics">
              <Button className="w-full" variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Start analyzing your call center recordings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-sm">Upload Calls</h3>
                <p className="text-xs text-muted-foreground">
                  Upload WAV files for analysis
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-sm">Automatic Processing</h3>
                <p className="text-xs text-muted-foreground">
                  AI analyzes against 8 QA dimensions
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold text-sm">Review Insights</h3>
                <p className="text-xs text-muted-foreground">
                  View scores and coaching recommendations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      {keyInsights && stats.analyzedCalls > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Key Insights</h2>
            <p className="text-muted-foreground">Trends and patterns across all analyzed calls</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Top Compliance Issues */}
            {keyInsights.topIssues.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-orange-500">⚠️</span>
                    Top Recurring Compliance Issues
                  </CardTitle>
                  <CardDescription>Most common compliance issues detected across calls</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {keyInsights.topIssues.map((issue, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 text-xs font-bold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium capitalize">{issue.category}</span>
                            <span className="text-xs text-muted-foreground">{issue.count} calls ({issue.percentage.toFixed(0)}%)</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-500"
                              style={{ width: `${issue.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quality Dimensions Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Quality Performance Trends
                </CardTitle>
                <CardDescription>Team strengths and improvement opportunities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Strengths */}
                <div>
                  <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                    <span>✅</span> Top Performing Dimensions
                  </h4>
                  <div className="space-y-2">
                    {keyInsights.strengths.map((strength, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm bg-green-50/50 dark:bg-green-950/20 p-2 rounded border border-green-200 dark:border-green-900">
                        <span className="font-medium capitalize">{strength.dimension}</span>
                        <span className="text-green-600 dark:text-green-400 font-bold">{strength.avgScore.toFixed(1)}/10</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Opportunities */}
                <div>
                  <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
                    <span>📈</span> Improvement Opportunities
                  </h4>
                  <div className="space-y-2">
                    {keyInsights.opportunities.map((opp, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded border border-amber-200 dark:border-amber-900">
                        <span className="font-medium capitalize">{opp.dimension}</span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold">{opp.avgScore.toFixed(1)}/10</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
