import { cn } from '@/lib/utils';
import { FounderBadge } from './FounderBadge';
import type { IFounder } from '@/types/founder';

interface FounderAvatarProps {
  founder: IFounder;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  showName?: boolean;
  className?: string;
}

const SIZES = {
  sm:  'h-8 w-8',
  md:  'h-11 w-11',
  lg:  'h-14 w-14',
  xl:  'h-20 w-20',
};

const RING_COLORS = {
  founder:    'ring-2 ring-[#00FF88]/60',
  co_founder: 'ring-2 ring-indigo-500/60',
  core_team:  'ring-2 ring-blue-500/60',
  a5x_team:   'ring-2 ring-border',
};

export function FounderAvatar({ founder, size = 'md', showBadge = false, showName = false, className }: FounderAvatarProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="relative shrink-0">
        <img
          src={founder.avatar}
          alt={founder.name}
          className={cn('rounded-full object-cover', SIZES[size], RING_COLORS[founder.badge])}
        />
        {/* Verified dot */}
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#00FF88] text-[8px]">✓</span>
      </div>
      {showName && (
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{founder.name}</span>
            <FounderBadge badge={founder.badge} size="sm" />
          </div>
          <p className="text-xs text-muted-foreground">{founder.role}</p>
        </div>
      )}
    </div>
  );
}
