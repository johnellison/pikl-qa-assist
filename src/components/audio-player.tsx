/**
 * Audio Player Component
 * Simple audio player with play/pause and scrubbing
 */

'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Howl } from 'howler';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface AudioPlayerProps {
  audioUrl: string;
  className?: string;
}

export interface AudioPlayerRef {
  seekTo: (seconds: number) => void;
  play: () => void;
}

export const AudioPlayer = forwardRef<AudioPlayerRef, AudioPlayerProps>(
  function AudioPlayer({ audioUrl, className = '' }, ref) {
  const howlerRef = useRef<Howl | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    seekTo: (seconds: number) => {
      if (howlerRef.current) {
        howlerRef.current.seek(seconds);
        setCurrentTime(seconds);
      }
    },
    play: () => {
      if (howlerRef.current && !isPlaying) {
        howlerRef.current.play();
      }
    },
  }));

  // Initialize Howler
  useEffect(() => {
    const sound = new Howl({
      src: [audioUrl],
      format: ['wav', 'mp3'], // Specify supported formats
      html5: true, // Enable HTML5 Audio for streaming
      volume: volume,
      onload: () => {
        setDuration(sound.duration());
        setIsLoading(false);
      },
      onplay: () => {
        setIsPlaying(true);
        // Update current time every 100ms
        intervalRef.current = setInterval(() => {
          setCurrentTime(sound.seek());
        }, 100);
      },
      onpause: () => {
        setIsPlaying(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      },
      onend: () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      },
      onloaderror: () => {
        console.error('Audio player error: Failed to load audio');
        setIsLoading(false);
      },
      onplayerror: () => {
        console.error('Audio player error: Failed to play audio');
        setIsLoading(false);
      },
    });

    howlerRef.current = sound;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      sound.unload();
    };
  }, [audioUrl, volume]);

  const togglePlayPause = () => {
    if (!howlerRef.current) return;

    if (isPlaying) {
      howlerRef.current.pause();
    } else {
      howlerRef.current.play();
    }
  };

  const handleSeek = (value: number[]) => {
    if (!howlerRef.current) return;
    const seekTime = value[0];
    howlerRef.current.seek(seekTime);
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (howlerRef.current) {
      howlerRef.current.volume(newVolume);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-card border rounded-lg p-4 space-y-3 ${className}`}>
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <Button
          onClick={togglePlayPause}
          disabled={isLoading}
          size="icon"
          variant="outline"
          className="shrink-0"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        {/* Time Display */}
        <span className="text-sm font-mono text-muted-foreground shrink-0 min-w-[80px]">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Seek Slider */}
        <div className="flex-1">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            disabled={isLoading}
            className="cursor-pointer"
          />
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 shrink-0 w-32">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="cursor-pointer"
          />
        </div>
      </div>

      {isLoading && (
        <p className="text-xs text-muted-foreground">Loading audio...</p>
      )}
    </div>
  );
});
