import { useState } from 'react';
import { Heart, MessageSquare, Pin, ChevronDown, ChevronUp } from 'lucide-react';
import { FounderAvatar } from './FounderAvatar';
import { cn, formatRelativeTime, formatNumber } from '@/lib/utils';
import type { IFounderPost } from '@/types/founder';
import ReactMarkdown from 'react-markdown';

interface FounderPostCardProps {
  post: IFounderPost;
  compact?: boolean;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  announcement:      { label: 'Announcement',      color: 'text-yellow-400',  bg: 'bg-yellow-400/10 border-yellow-400/20' },
  roadmap:           { label: 'Roadmap Update',     color: 'text-blue-400',    bg: 'bg-blue-400/10 border-blue-400/20' },
  product_update:    { label: 'Product Update',     color: 'text-primary',     bg: 'bg-primary/10 border-primary/20' },
  behind_scenes:     { label: 'Behind the Scenes',  color: 'text-purple-400',  bg: 'bg-purple-400/10 border-purple-400/20' },
  ama:               { label: 'AMA Session',        color: 'text-orange-400',  bg: 'bg-orange-400/10 border-orange-400/20' },
  vision:            { label: 'Vision',             color: 'text-pink-400',    bg: 'bg-pink-400/10 border-pink-400/20' },
  monthly_letter:    { label: 'Monthly Letter',     color: 'text-indigo-400',  bg: 'bg-indigo-400/10 border-indigo-400/20' },
  poll:              { label: 'Poll',               color: 'text-cyan-400',    bg: 'bg-cyan-400/10 border-cyan-400/20' },
  community_question:{ label: 'Community Q&A',      color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
};

export function FounderPostCard({ post, compact = false }: FounderPostCardProps) {
  const [liked, setLiked] = useState(post.hasLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [expanded, setExpanded] = useState(!compact);

  const typeConfig = TYPE_CONFIG[post.type] || TYPE_CONFIG.announcement;
  const isLong = post.content.length > 400;

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <article className={cn(
      'relative rounded-2xl border bg-card overflow-hidden transition-all duration-200',
      post.isPinned
        ? 'border-[#00FF88]/30 shadow-[0_0_30px_rgba(0,255,136,0.06)]'
        : 'border-border hover:border-border/80'
    )}>
      {/* Pinned indicator */}
      {post.isPinned && (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-[#00FF88]/5 border-b border-[#00FF88]/20">
          <Pin className="h-3 w-3 text-[#00FF88]" />
          <span className="text-xs font-medium text-[#00FF88]">Pinned by Founder</span>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <FounderAvatar founder={post.founder} size="md" showName />
          <div className="flex items-center gap-2 shrink-0">
            <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full border', typeConfig.bg, typeConfig.color)}>
              {typeConfig.label}
            </span>
            <span className="text-xs text-muted-foreground">{formatRelativeTime(post.createdAt)}</span>
          </div>
        </div>

        {/* Title */}
        <h2 className={cn('font-bold text-foreground leading-snug mb-4', compact ? 'text-lg' : 'text-xl')}>
          {post.title}
        </h2>

        {/* Content */}
        <div className={cn('relative', !expanded && isLong && 'max-h-40 overflow-hidden')}>
          <div className="prose prose-invert prose-sm max-w-none prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-headings:text-foreground">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
          {/* Fade overlay when collapsed */}
          {!expanded && isLong && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent" />
          )}
        </div>

        {/* Read more toggle */}
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors mt-3 font-medium"
          >
            {expanded ? (
              <><ChevronUp className="h-3.5 w-3.5" /> Show less</>
            ) : (
              <><ChevronDown className="h-3.5 w-3.5" /> Read full post</>
            )}
          </button>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {post.tags.map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center gap-5 mt-5 pt-4 border-t border-border">
          <button
            onClick={handleLike}
            className={cn(
              'flex items-center gap-1.5 text-sm transition-colors',
              liked ? 'text-red-400' : 'text-muted-foreground hover:text-red-400'
            )}
          >
            <Heart className={cn('h-4 w-4', liked && 'fill-red-400')} />
            <span className="font-medium">{formatNumber(likeCount)}</span>
          </button>
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <MessageSquare className="h-4 w-4" />
            <span className="font-medium">{formatNumber(post.commentCount)}</span>
          </button>
          <div className="ml-auto">
            <span className="text-xs text-muted-foreground italic">— {post.founder.name}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
