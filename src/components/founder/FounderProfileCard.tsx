import { Twitter, Github, Linkedin, Users, MessageSquare, CheckCircle } from 'lucide-react';
import { FounderBadge } from './FounderBadge';
import { cn, formatNumber } from '@/lib/utils';
import type { IFounder } from '@/types/founder';

interface FounderProfileCardProps {
  founder: IFounder;
  compact?: boolean;
}

export function FounderProfileCard({ founder, compact = false }: FounderProfileCardProps) {
  return (
    <div className={cn(
      'rounded-2xl border bg-card overflow-hidden',
      founder.badge === 'founder'
        ? 'border-[#00FF88]/20'
        : founder.badge === 'co_founder'
        ? 'border-indigo-500/20'
        : 'border-border'
    )}>
      {/* Top gradient bar */}
      <div className={cn(
        'h-1.5',
        founder.badge === 'founder'
          ? 'bg-gradient-to-r from-[#00FF88] to-emerald-400'
          : founder.badge === 'co_founder'
          ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
          : 'bg-gradient-to-r from-blue-500 to-cyan-500'
      )} />

      <div className="p-5">
        {/* Avatar + name */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative shrink-0">
            <img
              src={founder.avatar}
              alt={founder.name}
              className={cn(
                'h-14 w-14 rounded-full object-cover',
                founder.badge === 'founder' ? 'ring-2 ring-[#00FF88]/50' : 'ring-2 ring-indigo-500/50'
              )}
            />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-black">✓</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base text-foreground">{founder.name}</h3>
              <FounderBadge badge={founder.badge} size="sm" />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{founder.role}</p>
          </div>
        </div>

        {!compact && (
          <>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">{founder.bio}</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: 'Followers', value: formatNumber(founder.followers), icon: Users },
                { label: 'Posts', value: founder.postsCount, icon: MessageSquare },
                { label: 'Answers', value: founder.answersCount, icon: CheckCircle },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="text-center p-2 rounded-lg bg-secondary">
                  <p className="text-sm font-bold text-foreground">{value}</p>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>

            {/* Social links */}
            <div className="flex items-center gap-2">
              {founder.social.twitter && (
                <a href={`https://twitter.com/${founder.social.twitter}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg bg-secondary border border-border">
                  <Twitter className="h-3 w-3" /> @{founder.social.twitter}
                </a>
              )}
              {founder.social.github && (
                <a href={`https://github.com/${founder.social.github}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg bg-secondary border border-border">
                  <Github className="h-3 w-3" />
                </a>
              )}
              {founder.social.linkedin && (
                <a href={`https://linkedin.com/in/${founder.social.linkedin}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg bg-secondary border border-border">
                  <Linkedin className="h-3 w-3" />
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
