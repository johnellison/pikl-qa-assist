'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Upload, FileText, Sparkles, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type ProcessingStage = 'uploading' | 'transcribing' | 'analyzing' | 'complete' | 'error';

interface UploadProgressTrackerProps {
  callId: string;
  filename: string;
  onComplete?: () => void;
}

export function UploadProgressTracker({
  callId,
  filename,
  onComplete,
}: UploadProgressTrackerProps) {
  const [currentStage, setCurrentStage] = useState<ProcessingStage>('uploading');
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [stageStartTime, setStageStartTime] = useState<number>(Date.now());

  // Track elapsed time for current stage
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - stageStartTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [stageStartTime]);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    const pollCallStatus = async () => {
      try {
        const response = await fetch(`/api/calls/${callId}`);
        const data = await response.json();

        if (data.success && data.data.call) {
          const status = data.data.call.status;
          const prevStage = currentStage;

          let newStage: ProcessingStage = currentStage;

          switch (status) {
            case 'pending':
              newStage = 'uploading';
              break;
            case 'transcribing':
              newStage = 'transcribing';
              break;
            case 'analyzing':
              newStage = 'analyzing';
              break;
            case 'complete':
              newStage = 'complete';
              if (onComplete) onComplete();
              clearInterval(pollInterval);
              break;
            case 'error':
              newStage = 'error';
              setError(data.data.call.errorMessage || 'Processing failed');
              clearInterval(pollInterval);
              break;
          }

          // Reset timer when stage changes
          if (newStage !== prevStage) {
            setStageStartTime(Date.now());
            setElapsedTime(0);
          }

          setCurrentStage(newStage);
        }
      } catch (err) {
        console.error('Error polling call status:', err);
      }
    };

    // Poll every 2 seconds
    pollInterval = setInterval(pollCallStatus, 2000);
    pollCallStatus(); // Initial check

    return () => clearInterval(pollInterval);
  }, [callId, onComplete, currentStage]);

  const stages = [
    {
      id: 'uploading',
      label: 'Uploading',
      icon: Upload,
      color: 'pikl-pink',
    },
    {
      id: 'transcribing',
      label: 'Transcribing',
      icon: FileText,
      color: 'pikl-mint',
    },
    {
      id: 'analyzing',
      label: 'Analyzing',
      icon: Sparkles,
      color: 'pikl-teal',
    },
  ];

  const getCurrentStageIndex = () => {
    if (currentStage === 'complete') return 3;
    if (currentStage === 'error') return -1;
    return stages.findIndex((s) => s.id === currentStage);
  };

  const currentStageIndex = getCurrentStageIndex();

  const formatElapsedTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const getEstimatedTime = (stage: ProcessingStage): string => {
    switch (stage) {
      case 'uploading':
        return 'Usually takes a few seconds';
      case 'transcribing':
        return 'Usually takes 2-4 minutes for typical calls';
      case 'analyzing':
        return 'Usually takes 15-30 seconds';
      default:
        return '';
    }
  };

  return (
    <Card className="border-2">
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Processing Call</h3>
            <p className="text-sm text-muted-foreground truncate">{filename}</p>
          </div>
          {currentStage === 'complete' && (
            <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
          )}
          {currentStage === 'error' && (
            <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0" />
          )}
        </div>

        {/* Progress Bar */}
        {currentStage !== 'error' && (
          <div className="space-y-3">
            {/* Multi-colored progress bar */}
            <div className="relative h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="absolute inset-0 flex">
                {stages.map((stage, index) => {
                  const isComplete = index < currentStageIndex || currentStage === 'complete';
                  const isActive = index === currentStageIndex;
                  const progress = isActive ? 50 : isComplete ? 100 : 0;

                  return (
                    <div
                      key={stage.id}
                      className="flex-1 relative"
                      style={{ width: `${100 / stages.length}%` }}
                    >
                      <div
                        className={`absolute inset-0 transition-all duration-500 ${
                          stage.color === 'pikl-pink'
                            ? 'bg-[#E31C79]'
                            : stage.color === 'pikl-mint'
                            ? 'bg-[#4DD4AC]'
                            : 'bg-[#3DBEAA]'
                        }`}
                        style={{
                          width: `${progress}%`,
                          opacity: progress > 0 ? 1 : 0.2,
                        }}
                      />
                      {isActive && (
                        <div
                          className="absolute inset-0 animate-pulse"
                          style={{
                            background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
                            animation: 'shimmer 1.5s infinite',
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stage Labels */}
            <div className="flex items-center justify-between">
              {stages.map((stage, index) => {
                const Icon = stage.icon;
                const isComplete = index < currentStageIndex || currentStage === 'complete';
                const isActive = index === currentStageIndex;

                return (
                  <div
                    key={stage.id}
                    className="flex flex-col items-center gap-1 flex-1"
                  >
                    <div
                      className={`rounded-full p-2 transition-colors ${
                        isComplete
                          ? 'bg-green-100 dark:bg-green-950'
                          : isActive
                          ? stage.color === 'pikl-pink'
                            ? 'bg-pink-100 dark:bg-pink-950'
                            : stage.color === 'pikl-mint'
                            ? 'bg-teal-100 dark:bg-teal-950'
                            : 'bg-cyan-100 dark:bg-cyan-950'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : isActive ? (
                        <Icon className="h-4 w-4 text-primary animate-pulse" />
                      ) : (
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isComplete || isActive ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Status Messages */}
        {currentStage === 'uploading' && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading file to server...
            </div>
            <div className="text-xs text-muted-foreground">
              Elapsed: {formatElapsedTime(elapsedTime)} • {getEstimatedTime('uploading')}
            </div>
          </div>
        )}
        {currentStage === 'transcribing' && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Transcribing audio with AssemblyAI...
            </div>
            <div className="text-xs text-muted-foreground">
              Elapsed: {formatElapsedTime(elapsedTime)} • {getEstimatedTime('transcribing')}
            </div>
            {elapsedTime > 60 && (
              <div className="text-xs text-muted-foreground italic">
                Still processing... Longer calls can take 3-5 minutes.
              </div>
            )}
          </div>
        )}
        {currentStage === 'analyzing' && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing transcript with Claude AI...
            </div>
            <div className="text-xs text-muted-foreground">
              Elapsed: {formatElapsedTime(elapsedTime)} • {getEstimatedTime('analyzing')}
            </div>
          </div>
        )}
        {currentStage === 'complete' && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-green-600 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Processing complete! Your call has been analyzed.
            </div>
            <Link href={`/calls/${callId}`}>
              <Button className="w-full">View Analysis</Button>
            </Link>
          </div>
        )}
        {currentStage === 'error' && error && (
          <div className="space-y-3">
            <div className="text-sm text-destructive flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Add shimmer animation to globals.css
