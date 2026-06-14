import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowUp, ArrowDown, Eye, ArrowLeft, Share2, Repeat2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { UserAvatar } from '@/components/common/UserAvatar';
import { RoleBadge } from '@/components/common/RoleBadge';
import { CommentThread } from '@/components/comments/CommentThread';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';
import { postService } from '@/services/postService';
import { useToast } from '@/store/uiStore';
import { cn, formatDateTime, formatNumber } from '@/lib/utils';
import { QUERY_KEYS } from '@/lib/constants';
import ReactMarkdown from 'react-markdown';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.POST, id],
    queryFn: () => postService.getPost(id!),
    enabled: !!id,
  });

  const handleVote = async (type: 'up' | 'down') => {
    if (!isAuthenticated) { error('Sign in to vote'); return; }
    try {
      if (type === 'up') await postService.upvotePost(id!);
      else await postService.downvotePost(id!);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.POST, id] });
    } catch { /* handled */ }
  };

  const repostMutation = useMutation({
    mutationFn: () => postService.repostPost(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.POST, id] });
      success('Reposted!');
    },
    onError: () => error('Failed to repost'),
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    success('Link copied');
  };

  const hasReposted = post?.reposts?.includes(user?._id || '');

  if (isLoading) return <PageLoader />;
  if (!post) return <div className="text-center py-16 text-muted-foreground">Post not found.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={post.type === 'announcement' ? 'warning' : post.type === 'question' ? 'info' : 'secondary'}>
            {post.type}
          </Badge>
          {post.tags.map((tag) => <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>)}
          <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto" onClick={handleShare}>
            <Share2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <h1 className="text-2xl font-bold leading-snug">{post.title}</h1>

        <div className="flex items-center gap-3 flex-wrap">
          <UserAvatar user={post.author} size="sm" linkToProfile showVerified />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{post.author.displayName}</p>
              <RoleBadge role={post.author.role} size="xs" />
            </div>
            <p className="text-xs text-muted-foreground">{formatDateTime(post.createdAt)}</p>
          </div>
        </div>

        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {post.images?.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {post.images.map((img, i) => <img key={i} src={img} alt="" className="rounded-lg w-full object-cover max-h-64" />)}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2 border-t border-border flex-wrap">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleVote('up')}>
              <ArrowUp className={cn('h-4 w-4', post.voteScore > 0 && 'text-primary')} />
            </Button>
            <span className={cn('text-sm font-semibold tabular-nums min-w-[2ch] text-center', post.voteScore > 0 ? 'text-primary' : 'text-muted-foreground')}>
              {post.voteScore}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleVote('down')}>
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Repost button */}
          {isAuthenticated && (
            <button
              onClick={() => repostMutation.mutate()}
              disabled={repostMutation.isPending}
              className={cn(
                'flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors',
                hasReposted
                  ? 'text-[#00FF88] bg-[#00FF88]/10'
                  : 'text-muted-foreground hover:text-[#00FF88] hover:bg-[#00FF88]/10'
              )}>
              <Repeat2 className="h-3.5 w-3.5" />
              {formatNumber(post.repostCount || 0)}
            </button>
          )}

          <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
            <Eye className="h-3.5 w-3.5" /> {formatNumber(post.viewCount)} views
          </span>
        </div>
      </Card>

      <Card className="p-6">
        <CommentThread postId={id!} commentCount={post.commentCount} />
      </Card>
    </div>
  );
}
