import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Headphones } from 'lucide-react';
import { FounderBadge } from '@/components/founder/FounderBadge';
import { cn, formatRelativeTime, formatNumber } from '@/lib/utils';
import type { IVoiceNote } from '@/types/engagement';

interface VoiceNoteCardProps {
  note: IVoiceNote;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VoiceNoteCard({ note }: VoiceNoteCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalSeconds = note.duration;

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) { setIsPlaying(false); return 0; }
          return p + (100 / totalSeconds) * 0.5;
        });
      }, 500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, totalSeconds]);

  const currentSeconds = Math.floor((progress / 100) * totalSeconds);
  const badgeType = note.founder.badge as 'founder' | 'co_founder' | 'core_team' | 'a5x_team';

  return (
    <div className={cn(
      'rounded-2xl border bg-card overflow-hidden transition-all duration-200',
      badgeType === 'founder' ? 'border-[#00FF88]/20' : 'border-indigo-500/20'
    )}>
      {/* Top accent */}
      <div className={cn('h-0.5', badgeType === 'founder' ? 'bg-gradient-to-r from-[#00FF88] to-emerald-400' : 'bg-gradient-to-r from-indigo-500 to-purple-500')} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="relative shrink-0">
            <img src={note.founder.avatar} alt={note.founder.name}
              className={cn('h-11 w-11 rounded-full', badgeType === 'founder' ? 'ring-2 ring-[#00FF88]/40' : 'ring-2 ring-indigo-500/40')} />
            {isPlaying && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 rounded-full bg-[#00FF88] items-center justify-center">
                <span className="animate-ping absolute h-full w-full rounded-full bg-[#00FF88] opacity-75" />
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-sm font-semibold text-foreground">{note.founder.name}</span>
              <FounderBadge badge={badgeType} size="sm" />
            </div>
            <p className="text-xs text-muted-foreground">{note.founder.role} · {formatRelativeTime(note.publishedAt)}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Headphones className="h-3.5 w-3.5" />
            {formatNumber(note.listenCount)}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm text-foreground mb-4 leading-snug">{note.title}</h3>

        {/* Waveform + Player */}
        <div className="rounded-xl bg-secondary/50 border border-border p-4">
          {/* Waveform visualization */}
          <div className="flex items-center gap-[2px] h-10 mb-3 cursor-pointer"
            onClick={() => setIsPlaying(!isPlaying)}>
            {note.waveform.map((val, i) => {
              const barProgress = (i / note.waveform.length) * 100;
              const isActive = barProgress <= progress;
              return (
                <div
                  key={i}
                  className={cn(
                    'flex-1 rounded-full transition-all duration-100',
                    isActive
                      ? badgeType === 'founder' ? 'bg-[#00FF88]' : 'bg-indigo-400'
                      : 'bg-border'
                  )}
                  style={{ height: `${Math.max(15, val * 100)}%` }}
                />
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full transition-all shrink-0',
                badgeType === 'founder'
                  ? 'bg-[#00FF88] text-black hover:bg-[#00FF88]/90'
                  : 'bg-indigo-500 text-white hover:bg-indigo-400'
              )}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </button>

            {/* Progress bar */}
            <div className="flex-1">
              <div className="h-1 bg-border rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', badgeType === 'founder' ? 'bg-[#00FF88]' : 'bg-indigo-400')}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <span className="text-xs text-muted-foreground tabular-nums shrink-0">
              {formatDuration(currentSeconds)} / {formatDuration(totalSeconds)}
            </span>
          </div>
        </div>

        {/* Transcript toggle */}
        {note.transcript && (
          <div className="mt-3">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showTranscript ? '▲ Hide transcript' : '▼ Show transcript'}
            </button>
            {showTranscript && (
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed border-l-2 border-border pl-3 italic">
                {note.transcript}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
