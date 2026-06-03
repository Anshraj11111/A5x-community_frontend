import { Link } from 'react-router-dom';
import { ArrowUp, MessageSquare, Eye, Pin, Lock, Bookmark } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/common/UserAvatar';
import { Button } from '@/components/ui/button';
import { cn, formatRelativeTime, formatNumber } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { postService } from '@/services/postService';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import type { IPost } from '@/types';

interface PostCardProps {
  post: IPost;
  compact?: boolean;
}

const typeColors = {
  discussion: 'secondary' as const,
  question: 'info' as const,
  announcement: 'warning' as const,
};

export function PostCard({ post, compact = false }: PostCardProps) {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    try {
      await postService.upvotePost(post._id);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.POSTS] });
    } catch {
      // handled by interceptor
    }
  };

  return (
    <Card className={cn('card-hover group', compact ? 'p-4' : 'p-5')}>
      <Link to={`/discussions/${post._id}`} className="block">
        <div className="flex gap-4">
          {/* Vote column */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 rounded-lg',
                post.voteScore > 0 ? 'text-primary' : 'text-muted-foreground'
              )}
              onClick={handleUpvote}
              aria-label="Upvote"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <span className={cn(
              'text-sm font-semibold tabular-nums',
              post.voteScore > 0 ? 'text-primary' : 'text-muted-foreground'
            )}>
              {formatNumber(post.voteScore)}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {post.isPinned && (
                <Pin className="h-3.5 w-3.5 text-primary shrink-0" />
              )}
              {post.isLocked && (
                <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              )}
              <Badge variant={typeColors[post.type]} className="text-[10px]">
                {post.type}
              </Badge>
              {post.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>

            <h3 className={cn(
              'font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2',
              compact ? 'text-sm' : 'text-base'
            )}>
              {post.title}
            </h3>

            {!compact && (
              <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                {post.content.replace(/[#*`]/g, '').slice(0, 150)}
              </p>
            )}

            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <UserAvatar user={post.author} size="xs" />
                <span className="text-xs text-muted-foreground">
                  <span className="text-foreground font-medium">{post.author.displayName}</span>
                  {' · '}
                  {formatRelativeTime(post.createdAt)}
                </span>
              </div>

              <div className="flex items-center gap-3 ml-auto text-muted-foreground">
                <span className="flex items-center gap-1 text-xs">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {formatNumber(post.commentCount)}
                </span>
                <span className="flex items-center gap-1 text-xs">
                  <Eye className="h-3.5 w-3.5" />
                  {formatNumber(post.viewCount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
}
