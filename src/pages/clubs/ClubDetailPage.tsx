import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, ArrowLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { PostCard } from '@/components/posts/PostCard';
import { PageLoader, InlineLoader } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { clubService } from '@/services/clubService';
import { useToast } from '@/store/uiStore';
import { formatNumber } from '@/lib/utils';
import { QUERY_KEYS } from '@/lib/constants';

export default function ClubDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const { data: club, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.CLUB, slug],
    queryFn: () => clubService.getClub(slug!),
    enabled: !!slug,
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: [QUERY_KEYS.CLUB, slug, 'posts'],
    queryFn: () => clubService.getClubPosts(slug!, { limit: 20 }),
    enabled: !!slug,
  });

  const handleJoinLeave = async () => {
    if (!isAuthenticated) { error('Sign in first'); return; }
    try {
      if (club?.isMember) {
        await clubService.leaveClub(slug!);
        success('Left club');
      } else {
        await clubService.joinClub(slug!);
        success('Joined club');
      }
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLUB, slug] });
    } catch (err: unknown) {
      error((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Action failed');
    }
  };

  if (isLoading) return <PageLoader />;
  if (!club) return <div className="text-center py-16 text-muted-foreground">Club not found.</div>;

  const isOwner = club.owner._id === user?._id;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5 -ml-2">
        <ArrowLeft className="h-4 w-4" /> All Clubs
      </Button>

      <Card className="overflow-hidden">
        <div className="relative h-36 bg-gradient-to-br from-secondary to-background">
          {club.coverImage && <img src={club.coverImage} alt="" className="w-full h-full object-cover" />}
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{club.name}</h1>
                {club.isPrivate && <Badge variant="secondary" className="text-[10px] gap-1"><Lock className="h-2.5 w-2.5" /> Private</Badge>}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{club.description}</p>
            </div>
            {!isOwner && (
              <Button size="sm" variant={club.isMember ? 'outline' : 'default'} onClick={handleJoinLeave} className="shrink-0">
                {club.isMember ? 'Leave' : 'Join Club'}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {formatNumber(club.memberCount)} members</span>
            <span>{formatNumber(club.postCount)} posts</span>
          </div>
          {club.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {club.tags.map((tag) => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
            </div>
          )}
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-base font-semibold">Recent Posts</h2>
        {postsLoading ? <InlineLoader /> : postsData?.data.length === 0 ? (
          <EmptyState icon={Users} title="No posts yet" description="Be the first to post in this club" />
        ) : (
          <div className="space-y-3">
            {postsData?.data.map((post) => <PostCard key={post._id} post={post} compact />)}
          </div>
        )}
      </div>
    </div>
  );
}
