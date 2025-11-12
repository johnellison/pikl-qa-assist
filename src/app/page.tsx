'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Upload, TrendingUp, Users, CheckCircle2 } from "lucide-react";

export default function Home() {
  const [stats, setStats] = useState({
    totalCalls: 0,
    analyzedCalls: 0,
    totalStorageBytes: 0,
  });
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

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
    </div>
  );
}
