import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/utils';

interface PodiumClub {
  rank: number;
  club: {
    _id?: string;
    name: string;
    icon?: string;
    slug: string;
  };
  score: number;
}

interface PodiumDisplayProps {
  topClubs: PodiumClub[];
}

const RANK_CONFIG: Record<number, { height: string; medal: string; bg: string; border: string }> = {
  1: { height: 'h-24', medal: '🏆', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  2: { height: 'h-16', medal: '🥈', bg: 'bg-zinc-500/10', border: 'border-zinc-500/30' },
  3: { height: 'h-12', medal: '🥉', bg: 'bg-orange-700/10', border: 'border-orange-700/30' },
};

function PodiumBlock({ item }: { item: PodiumClub }) {
  const cfg = RANK_CONFIG[item.rank];
  if (!cfg) return null;

  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      {/* Club info above the block */}
      <Link
        to={`/clubs/${item.club.slug}`}
        className="flex flex-col items-center gap-1 group"
      >
        <div className="text-2xl">{item.club.icon || '🏅'}</div>
        <span className="text-xs font-semibold text-center leading-tight group-hover:text-primary transition-colors line-clamp-2 max-w-[80px]">
          {item.club.name}
        </span>
        <span className="text-[11px] text-muted-foreground font-medium">
          {formatNumber(item.score)} pts
        </span>
      </Link>

      {/* Podium block */}
      <div
        className={cn(
          'w-full rounded-t-lg border flex items-center justify-center font-bold text-lg',
          cfg.height,
          cfg.bg,
          cfg.border
        )}
      >
        {cfg.medal}
      </div>
    </div>
  );
}

export function PodiumDisplay({ topClubs }: PodiumDisplayProps) {
  if (!topClubs || topClubs.length === 0) return null;

  // Arrange: 2nd left, 1st center, 3rd right
  const ordered: (PodiumClub | undefined)[] = [
    topClubs.find((c) => c.rank === 2),
    topClubs.find((c) => c.rank === 1),
    topClubs.find((c) => c.rank === 3),
  ];

  return (
    <div className="flex items-end gap-2 px-4 pt-6">
      {ordered.map((item, i) =>
        item ? <PodiumBlock key={i} item={item} /> : <div key={i} className="flex-1" />
      )}
    </div>
  );
}
