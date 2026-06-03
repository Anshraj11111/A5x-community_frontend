import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowUp, ArrowLeft, ExternalLink, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { UserAvatar } from '@/components/common/UserAvatar';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';
import { showcaseService } from '@/services/showcaseService';
import { useToast } from '@/store/uiStore';
import { cn, formatDateTime, formatNumber } from '@/lib/utils';
import { QUERY_KEYS } from '@/lib/constants';

export default function ShowcaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { error } = useToast();
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.SHOWCASE, id],
    queryFn: () => showcaseService.getShowcasePost(id!),
    enabled: !!id,
  });

  const handleUpvote = async () => {
    if (!isAuthenticated) { error('Sign in to upvote'); return; }
    try { await showcaseService.upvoteShowcase(id!); queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SHOWCASE, id] }); }
    catch { /* handled */ }
  };

  if (isLoading) return <PageLoader />;
  if (!post) return <div className="text-center py-16 text-muted-foreground">Project not found.</div>;

  const hasUpvoted = post.upvotes.includes(user?._id || '');

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back to Showcase
      </Button>
      <Card className="overflow-hidden">
        {post.images[0] && <img src={post.images[0]} alt={post.title} className="w-full max-h-80 object-cover" />}
        <div className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold">{post.title}</h1>
            <Button variant={hasUpvoted ? 'default' : 'outline'} size="sm" className="gap-1.5 shrink-0" onClick={handleUpvote}>
              <ArrowUp className="h-4 w-4" /> {formatNumber(post.voteScore)}
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <UserAvatar user={post.author} size="sm" linkToProfile showVerified />
            <div>
              <p className="text-sm font-medium">{post.author.displayName}</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(post.createdAt)}</p>
            </div>
          </div>
          {post.tags.length > 0 && <div className="flex flex-wrap gap-1.5">{post.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}</div>}
          <p className="text-sm text-muted-foreground leading-relaxed">{post.description}</p>
          {post.links && (
            <div className="flex flex-wrap gap-2">
              {post.links.live && <Button variant="outline" size="sm" asChild><a href={post.links.live} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Live Demo</a></Button>}
              {post.links.github && <Button variant="outline" size="sm" asChild><a href={post.links.github} target="_blank" rel="noopener noreferrer"><Github className="h-3.5 w-3.5 mr-1.5" /> GitHub</a></Button>}
            </div>
          )}
          {post.images.length > 1 && (
            <div className="grid grid-cols-2 gap-2">
              {post.images.slice(1).map((img, i) => <img key={i} src={img} alt="" className="rounded-lg w-full object-cover max-h-48" />)}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
