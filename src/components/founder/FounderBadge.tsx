import { cn } from '@/lib/utils';
import type { IFounder } from '@/types/founder';

interface FounderBadgeProps {
  badge: IFounder['badge'];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const BADGE_CONFIG = {
  founder: {
    label: 'Founder',
    bg: 'bg-gradient-to-r from-[#00FF88] to-emerald-400',
    text: 'text-black',
    icon: '⚡',
  },
  co_founder: {
    label: 'Co-Founder',
    bg: 'bg-gradient-to-r from-indigo-500 to-purple-500',
    text: 'text-white',
    icon: '🚀',
  },
  core_team: {
    label: 'Core Team',
    bg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    text: 'text-white',
    icon: '⭐',
  },
  a5x_team: {
    label: 'A5X Team',
    bg: 'bg-secondary border border-border',
    text: 'text-foreground',
    icon: '🔧',
  },
};

const SIZE = {
  sm: 'text-[10px] px-1.5 py-0.5 gap-0.5',
  md: 'text-xs px-2 py-1 gap-1',
  lg: 'text-sm px-3 py-1.5 gap-1.5',
};

export function FounderBadge({ badge, size = 'md', className }: FounderBadgeProps) {
  const config = BADGE_CONFIG[badge];
  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-semibold tracking-wide',
      config.bg, config.text, SIZE[size], className
    )}>
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}
