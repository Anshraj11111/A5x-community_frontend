import { useState } from 'react';
import { Bell, BellOff, Users } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import type { IRoadmapItem, RoadmapStatus } from '@/types/founder';

interface RoadmapCardProps {
  item: IRoadmapItem;
}

const STATUS_CONFIG: Record<RoadmapStatus, { label: string; color: string; bg: string; dot: string; step: number }> = {
  planned:     { label: 'Planned',     color: 'text-muted-foreground', bg: 'bg-secondary',          dot: 'bg-muted-foreground', step: 1 },
  researching: { label: 'Researching', color: 'text-blue-400',         bg: 'bg-blue-400/10',         dot: 'bg-blue-400',         step: 2 },
  designing:   { label: 'Designing',   color: 'text-purple-400',       bg: 'bg-purple-400/10',       dot: 'bg-purple-400',       step: 3 },
  developing:  { label: 'Developing',  color: 'text-yellow-400',       bg: 'bg-yellow-400/10',       dot: 'bg-yellow-400 animate-pulse', step: 4 },
  testing:     { label: 'Testing',     color: 'text-orange-400',       bg: 'bg-orange-400/10',       dot: 'bg-orange-400 animate-pulse', step: 5 },
  released:    { label: 'Released',    color: 'text-primary',          bg: 'bg-primary/10',          dot: 'bg-primary',          step: 6 },
};

const STEPS: RoadmapStatus[] = ['planned', 'researching', 'designing', 'developing', 'testing', 'released'];

export function RoadmapCard({ item }: RoadmapCardProps) {
  const [following, setFollowing] = useState(item.isFollowing);
  const [followerCount, setFollowerCount] = useState(item.followers);
  const config = STATUS_CONFIG[item.status];
  const currentStep = config.step;

  const handleFollow = () => {
    setFollowing(!following);
    setFollowerCount(following ? followerCount - 1 : followerCount + 1);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 hover:border-border/80 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full border border-border">
              {item.product}
            </span>
            <span className="text-xs text-muted-foreground">{item.quarter}</span>
          </div>
          <h3 className="font-semibold text-sm text-foreground leading-snug">{item.title}</h3>
        </div>
        <button
          onClick={handleFollow}
          className={cn(
            'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all shrink-0',
            following
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'border-border text-muted-foreground hover:border-primary/30 hover:text-primary'
          )}
        >
          {following ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
          {following ? 'Following' : 'Follow'}
        </button>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed mb-4">{item.description}</p>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className={cn('text-xs font-semibold flex items-center gap-1.5', config.color)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
            {config.label}
          </span>
          <span className="text-xs text-muted-foreground">{currentStep}/6</span>
        </div>
        <div className="flex gap-1">
          {STEPS.map((step, i) => (
            <div
              key={step}
              className={cn(
                'h-1 flex-1 rounded-full transition-all duration-500',
                i < currentStep ? 'bg-primary' : 'bg-secondary'
              )}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Users className="h-3 w-3" />
        <span>{formatNumber(followerCount)} following</span>
      </div>
    </div>
  );
}
