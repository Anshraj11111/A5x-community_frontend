import { cn } from '@/lib/utils';

type Role = 'admin' | 'moderator' | 'founder' | 'co_founder' | 'user' | string;

interface RoleBadgeProps {
  role: Role;
  size?: 'xs' | 'sm';
  className?: string;
}

const ROLE_CONFIG: Record<string, { label: string; icon: string; classes: string } | undefined> = {
  founder: {
    label: 'Founder',
    icon: '⚡',
    classes: 'bg-gradient-to-r from-[#00FF88] to-emerald-400 text-black',
  },
  co_founder: {
    label: 'Co-Founder',
    icon: '🚀',
    classes: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white',
  },
  admin: {
    label: 'Admin',
    icon: '🛡️',
    classes: 'bg-gradient-to-r from-orange-500 to-red-500 text-white',
  },
  moderator: {
    label: 'Mod',
    icon: '⭐',
    classes: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
  },
  user: {
    label: 'Member',
    icon: '👤',
    classes: 'bg-[#1a1a1a] text-[#888] border border-[#2a2a2a]',
  },
};

const SIZE = {
  xs: 'text-[9px] px-1.5 py-0.5 gap-0.5',
  sm: 'text-[10px] px-2 py-0.5 gap-1',
};

export function RoleBadge({ role, size = 'sm', className }: RoleBadgeProps) {
  const config = ROLE_CONFIG[role];
  if (!config) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold tracking-wide shrink-0',
        config.classes,
        SIZE[size],
        className
      )}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}
