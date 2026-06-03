import { useState } from 'react';
import { Users, Trophy, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatNumber } from '@/lib/utils';
import type { IChallenge, ChallengeStatus, ChallengeDifficulty } from '@/types/engagement';

interface ChallengeCardProps {
  challenge: IChallenge;
  onClick?: () => void;
}

const STATUS_CONFIG: Record<ChallengeStatus, { label: string; color: string; dot: string }> = {
  upcoming: { label: 'Upcoming', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', dot: 'bg-blue-400' },
  live:     { label: 'Live Now', color: 'text-primary bg-primary/10 border-primary/20',    dot: 'bg-primary animate-pulse' },
  completed:{ label: 'Completed', color: 'text-muted-foreground bg-secondary border-border', dot: 'bg-muted-foreground' },
};

const DIFF_CONFIG: Record<ChallengeDifficulty, { label: string; color: string }> = {
  beginner:     { label: 'Beginner',     color: 'text-primary' },
  intermediate: { label: 'Intermediate', color: 'text-yellow-400' },
  advanced:     { label: 'Advanced',     color: 'text-red-400' },
};

function getTimeLeft(endDate: string): string {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return 'Ended';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
}

export function ChallengeCard({ challenge, onClick }: ChallengeCardProps) {
  const [joined, setJoined] = useState(challenge.isJoined);
  const statusConfig = STATUS_CONFIG[challenge.status];
  const diffConfig = DIFF_CONFIG[challenge.difficulty];

  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card overflow-hidden cursor-pointer',
        'hover:border-border/80 transition-all duration-200 group'
      )}
      onClick={onClick}
    >
      {/* Cover gradient */}
      <div className={cn('h-24 bg-gradient-to-br relative flex items-center justify-center', challenge.coverColor)}>
        <span className="text-5xl">{challenge.icon}</span>
        {/* Status badge */}
        <div className={cn('absolute top-3 right-3 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border', statusConfig.color)}>
          <span className={cn('h-1.5 w-1.5 rounded-full', statusConfig.dot)} />
          {statusConfig.label}
        </div>
      </div>

      <div className="p-5">
        {/* Category + difficulty */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-0.5 rounded-full border border-border capitalize">
            {challenge.category.replace('_', ' ')}
          </span>
          <span className={cn('text-[10px] font-semibold', diffConfig.color)}>
            {diffConfig.label}
          </span>
        </div>

        <h3 className="font-bold text-sm text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
          {challenge.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{challenge.description}</p>

        {/* Reward */}
        <div className="flex items-center gap-1.5 mb-4 p-2.5 rounded-lg bg-secondary/50 border border-border">
          <Trophy className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
          <span className="text-xs font-medium text-foreground line-clamp-1">{challenge.reward}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {formatNumber(challenge.participantCount)} joined
          </span>
          {challenge.status !== 'completed' && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {getTimeLeft(challenge.endDate)}
            </span>
          )}
        </div>

        {/* Action */}
        <div className="flex items-center gap-2">
          {challenge.status === 'live' && (
            <Button
              size="sm"
              variant={joined ? 'outline' : 'default'}
              className="flex-1 text-xs h-8"
              onClick={(e) => { e.stopPropagation(); setJoined(!joined); }}
            >
              {joined ? 'Joined ✓' : 'Join Challenge'}
            </Button>
          )}
          {challenge.status === 'upcoming' && (
            <Button size="sm" variant="outline" className="flex-1 text-xs h-8"
              onClick={(e) => { e.stopPropagation(); setJoined(!joined); }}>
              {joined ? 'Registered ✓' : 'Register Interest'}
            </Button>
          )}
          {challenge.status === 'completed' && (
            <Button size="sm" variant="outline" className="flex-1 text-xs h-8">
              View Results
            </Button>
          )}
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onClick}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
