import { cn, formatNumber } from '@/lib/utils';
import type { IHallOfFameUser } from '@/types/engagement';

interface HallOfFameRowProps {
  entry: IHallOfFameUser;
}

const RANK_STYLES: Record<number, { bg: string; text: string; ring: string; glow: string }> = {
  1: { bg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/10', text: 'text-yellow-400', ring: 'ring-2 ring-yellow-400/50', glow: 'shadow-[0_0_20px_rgba(234,179,8,0.15)]' },
  2: { bg: 'bg-gradient-to-r from-slate-400/20 to-slate-500/10',  text: 'text-slate-300',  ring: 'ring-2 ring-slate-400/50', glow: 'shadow-[0_0_20px_rgba(148,163,184,0.1)]' },
  3: { bg: 'bg-gradient-to-r from-orange-600/20 to-amber-700/10', text: 'text-orange-400', ring: 'ring-2 ring-orange-500/50', glow: 'shadow-[0_0_20px_rgba(234,88,12,0.1)]' },
};

export function HallOfFameRow({ entry }: HallOfFameRowProps) {
  const isTop3 = entry.rank <= 3;
  const rankStyle = RANK_STYLES[entry.rank];

  return (
    <div className={cn(
      'flex items-center gap-4 rounded-xl border p-4 transition-all duration-200',
      isTop3
        ? cn('border-transparent', rankStyle.bg, rankStyle.glow)
        : 'border-border bg-card hover:border-border/80'
    )}>
      {/* Rank */}
      <div className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-sm',
        isTop3 ? cn('bg-background/50', rankStyle.text) : 'bg-secondary text-muted-foreground'
      )}>
        {isTop3 ? entry.badge : `#${entry.rank}`}
      </div>

      {/* Avatar */}
      <div className="relative shrink-0">
        <img
          src={entry.user.avatarUrl}
          alt={entry.user.displayName}
          className={cn('h-10 w-10 rounded-full object-cover', isTop3 && rankStyle.ring)}
        />
        {entry.user.isVerified && (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-black">✓</span>
        )}
      </div>

      {/* Name + category */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn('text-sm font-semibold', isTop3 ? 'text-foreground' : 'text-foreground')}>
            {entry.user.displayName}
          </span>
          <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full border border-border hidden sm:inline">
            {entry.category}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">@{entry.user.username}</p>
      </div>

      {/* Stats */}
      <div className="hidden md:flex items-center gap-5 text-xs text-muted-foreground">
        <div className="text-center">
          <p className="font-bold text-foreground">{entry.bugsFound}</p>
          <p>Bugs</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-foreground">{entry.acceptedFeatures}</p>
          <p>Features</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-foreground">{entry.challengesWon}</p>
          <p>Wins</p>
        </div>
      </div>

      {/* Points */}
      <div className="text-right shrink-0">
        <p className={cn('text-base font-bold tabular-nums', isTop3 ? rankStyle.text : 'text-foreground')}>
          {formatNumber(entry.points)}
        </p>
        <p className="text-[10px] text-muted-foreground">points</p>
      </div>
    </div>
  );
}
