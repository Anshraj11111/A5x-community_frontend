import { Zap } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';

interface FounderReplyCardProps {
  founder: {
    name: string;
    role: string;
    avatar: string;
    badge: 'founder' | 'co_founder' | 'core_team';
  };
  content: string;
  createdAt: string;
  context?: string;
  className?: string;
}

const BADGE_STYLES = {
  founder:    { ring: 'ring-[#00FF88]/50', glow: 'shadow-[0_0_20px_rgba(0,255,136,0.08)]', border: 'border-[#00FF88]/25', bg: 'bg-[#00FF88]/[0.03]', label: 'Founder', labelColor: 'text-[#00FF88] bg-[#00FF88]/10 border-[#00FF88]/20' },
  co_founder: { ring: 'ring-indigo-500/50', glow: 'shadow-[0_0_20px_rgba(99,102,241,0.08)]', border: 'border-indigo-500/25', bg: 'bg-indigo-500/[0.03]', label: 'Co-Founder', labelColor: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' },
  core_team:  { ring: 'ring-blue-500/50',   glow: 'shadow-[0_0_20px_rgba(59,130,246,0.08)]', border: 'border-blue-500/25',   bg: 'bg-blue-500/[0.03]',   label: 'Core Team',  labelColor: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
};

export function FounderReplyCard({ founder, content, createdAt, context, className }: FounderReplyCardProps) {
  const style = BADGE_STYLES[founder.badge];

  return (
    <div className={cn(
      'rounded-xl border p-4 transition-all duration-200',
      style.border, style.bg, style.glow, className
    )}>
      {/* Official response label */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold" style={{ borderColor: 'rgba(0,255,136,0.2)', background: 'rgba(0,255,136,0.05)', color: '#00FF88' }}>
          <Zap className="h-3 w-3" />
          Official Response
        </div>
        {context && (
          <span className="text-xs text-muted-foreground">on {context}</span>
        )}
      </div>

      {/* Founder info */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative shrink-0">
          <img
            src={founder.avatar}
            alt={founder.name}
            className={cn('h-9 w-9 rounded-full ring-2', style.ring)}
          />
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#00FF88] text-[8px] font-bold text-black">✓</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{founder.name}</span>
            <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full border', style.labelColor)}>
              {style.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{founder.role} · {formatRelativeTime(createdAt)}</p>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-foreground leading-relaxed">{content}</p>
    </div>
  );
}
