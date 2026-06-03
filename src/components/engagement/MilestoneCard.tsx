import { cn, formatNumber } from '@/lib/utils';
import type { ICommunityMilestone } from '@/types/engagement';

interface MilestoneCardProps {
  milestone: ICommunityMilestone;
}

export function MilestoneCard({ milestone }: MilestoneCardProps) {
  const pct = Math.min(100, Math.round((milestone.value / milestone.target) * 100));
  const isAchieved = pct >= 100;

  return (
    <div className={cn(
      'rounded-xl border bg-card p-4 transition-all duration-200',
      isAchieved ? 'border-primary/20 bg-primary/[0.02]' : 'border-border'
    )}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <span className="text-2xl">{milestone.icon}</span>
        </div>
        {isAchieved && (
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
            ACHIEVED
          </span>
        )}
      </div>
      <p className={cn('text-2xl font-bold tabular-nums', milestone.color)}>
        {formatNumber(milestone.value)}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">{milestone.label}</p>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground">{pct}% of {formatNumber(milestone.target)}</span>
        </div>
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-700', isAchieved ? 'bg-primary' : 'bg-primary/50')}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
