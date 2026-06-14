import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Users, ArrowLeft, Lock, Trophy, Clock, Shield, ShieldOff, UserCheck, Check, X, Plus, Send } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PostCard } from '@/components/posts/PostCard';
import { PageLoader, InlineLoader } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ScoreBreakdownBar } from '@/components/championship/ScoreBreakdownBar';
import { UserAvatar } from '@/components/common/UserAvatar';
import { useAuthStore } from '@/store/authStore';
import { clubService } from '@/services/clubService';
import { championshipService, championshipKeys } from '@/services/championshipService';
import { postService } from '@/services/postService';
import { useToast } from '@/store/uiStore';
import { formatNumber, formatRelativeTime, cn } from '@/lib/utils';
import { QUERY_KEYS } from '@/lib/constants';
import { useQuery as useQ } from '@tanstack/react-query';

const FOUNDER_ROLES = new Set(['founder', 'co_founder', 'admin']);

interface JoinRequest {
  _id: string;
  user: { _id: string; username: string; displayName: string; avatarUrl?: string };
  message?: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export default function ClubDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  // ── All useState hooks first ──────────────────────────────────────────────
  const [requestLoading, setRequestLoading] = useState(false);
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<'discussion' | 'question' | 'announcement'>('discussion');

  // ── All useQuery hooks ────────────────────────────────────────────────────
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

  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: [QUERY_KEYS.CLUB, slug, 'members'],
    queryFn: () => clubService.getClubMembers(slug!, { limit: 50 }),
    enabled: !!slug,
  });

  const { data: joinRequestsData, isLoading: joinRequestsLoading } = useQ({
    queryKey: [QUERY_KEYS.CLUB, slug, 'join-requests'],
    queryFn: () => clubService.getJoinRequests(slug!, 'pending'),
    enabled: !!slug && !!isAuthenticated,
    refetchInterval: 30000,
  });

  const { data: currentSeason } = useQ({
    queryKey: championshipKeys.currentSeason,
    queryFn: () => championshipService.getCurrentSeason(),
  });

  const { data: allSeasons = [] } = useQ({
    queryKey: championshipKeys.seasons,
    queryFn: () => championshipService.getAllSeasons(),
  });

  const { data: clubScore, isLoading: scoreLoading } = useQ({
    queryKey: championshipKeys.clubScore(currentSeason?._id ?? '', slug ?? ''),
    queryFn: () => championshipService.getClubScore(currentSeason!._id, slug!),
    enabled: !!currentSeason?._id && !!slug,
  });

  // ── useMutation — must be before any early returns ────────────────────────
  const createPostMutation = useMutation({
    mutationFn: (vars: { clubId: string; title: string; content: string; type: string }) =>
      postService.createPost({
        title: vars.title,
        content: vars.content,
        type: vars.type,
        tags: [],
        clubId: vars.clubId,
      }),
    onSuccess: () => {
      success('Post published to club!');
      setPostTitle('');
      setPostContent('');
      setPostType('discussion');
      setShowPostForm(false);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLUB, slug, 'posts'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLUB, slug] });
    },
    onError: (err: unknown) => {
      error((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to create post');
    },
  });

  // ── Early returns AFTER all hooks ─────────────────────────────────────────
  if (isLoading) return <PageLoader />;
  if (!club) return <div className="text-center py-16 text-muted-foreground">Club not found.</div>;

  // ── Derived values ────────────────────────────────────────────────────────
  const isOwner = club.owner._id === user?._id;
  const isFounder = user && FOUNDER_ROLES.has(user.role);
  const memberRole = (club as unknown as { memberRole?: string }).memberRole;
  const isClubAdmin = isFounder || isOwner || memberRole === 'moderator' || memberRole === 'owner';
  const hasPendingRequest = (club as unknown as { hasPendingRequest?: boolean }).hasPendingRequest;
  const endedSeasons = allSeasons.filter((s) => s.status === 'ended');
  const members = membersData?.data ?? [];
  const joinRequests: JoinRequest[] = joinRequestsData?.data ?? [];
  const pendingCount = joinRequests.length;

  const tabs = [
    { value: 'posts', label: 'Posts' },
    { value: 'members', label: `Members (${club.memberCount})` },
    { value: 'championship', label: 'Championship', icon: <Trophy className="h-3.5 w-3.5" /> },
    ...(isClubAdmin ? [{
      value: 'requests',
      label: 'Join Requests',
      icon: <UserCheck className="h-3.5 w-3.5" />,
      badge: pendingCount > 0 ? pendingCount : undefined,
    }] : []),
  ];

  // ── Event handlers ────────────────────────────────────────────────────────
  const handleJoinLeave = async () => {
    if (!isAuthenticated) { error('Sign in first'); return; }
    try {
      if (club.isMember) {
        await clubService.leaveClub(slug!);
        success('Left club');
      } else {
        setRequestLoading(true);
        await clubService.requestJoin(slug!);
        success(club.isPrivate ? 'Join request sent! Waiting for approval.' : 'Joined club successfully!');
      }
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLUB, slug] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLUB, slug, 'members'] });
    } catch (err: unknown) {
      error((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Action failed');
    } finally { setRequestLoading(false); }
  };

  const handlePromote = async (memberId: string, currentRole: string) => {
    const newRole = currentRole === 'moderator' ? 'member' : 'moderator';
    setPromotingId(memberId);
    try {
      await clubService.updateMemberRole(slug!, memberId, newRole);
      success(newRole === 'moderator' ? 'Promoted to club moderator' : 'Demoted to member');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLUB, slug, 'members'] });
    } catch (err: unknown) {
      error((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed');
    } finally { setPromotingId(null); }
  };

  const handleJoinRequest = async (requestId: string, action: 'accept' | 'reject') => {
    setProcessingRequestId(requestId);
    try {
      await clubService.handleJoinRequest(slug!, requestId, action);
      success(action === 'accept' ? 'Member added to club!' : 'Request rejected');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLUB, slug, 'join-requests'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLUB, slug, 'members'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLUB, slug] });
    } catch (err: unknown) {
      error((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed');
    } finally { setProcessingRequestId(null); }
  };

  const handlePublishPost = () => {
    if (!postTitle.trim() || !postContent.trim()) return;
    createPostMutation.mutate({
      clubId: club._id,
      title: postTitle.trim(),
      content: postContent.trim(),
      type: postType,
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────
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
            <div className="flex items-center gap-3">
              {club.icon && (
                <img src={club.icon} alt="" className="h-12 w-12 rounded-xl object-cover ring-2 ring-border -mt-10 bg-card" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">{club.name}</h1>
                  {club.isPrivate && <Badge variant="secondary" className="text-[10px] gap-1"><Lock className="h-2.5 w-2.5" /> Private</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{club.description}</p>
              </div>
            </div>
            {!isOwner && (
              <Button size="sm" variant={club.isMember ? 'outline' : 'default'}
                onClick={handleJoinLeave} disabled={requestLoading || hasPendingRequest} className="shrink-0">
                {club.isMember ? 'Leave'
                  : hasPendingRequest ? <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Pending</span>
                  : requestLoading ? 'Sending...'
                  : club.isPrivate ? 'Request to Join' : 'Join Club'}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Users className="h-4 w-4" />{formatNumber(club.memberCount)} members</span>
            <span>{formatNumber(club.postCount)} posts</span>
          </div>
          {club.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {club.tags.map((tag) => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
            </div>
          )}
        </div>
      </Card>

      <Tabs.Root defaultValue="posts">
        <Tabs.List className="flex gap-1 border-b border-border mb-4 overflow-x-auto">
          {tabs.map((tab) => (
            <Tabs.Trigger key={tab.value} value={tab.value}
              className={cn('flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 border-transparent -mb-px transition-colors whitespace-nowrap',
                'text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary')}>
              {tab.icon}{tab.label}
              {'badge' in tab && tab.badge
                ? <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">{tab.badge}</span>
                : null}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* Posts tab */}
        <Tabs.Content value="posts" className="space-y-4">
          {isAuthenticated && (club.isMember || isClubAdmin) && (
            !showPostForm ? (
              <button onClick={() => setShowPostForm(true)}
                className="w-full flex items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-secondary/30 transition-all">
                <Plus className="h-4 w-4 shrink-0" />
                <span>Write a post for this club...</span>
              </button>
            ) : (
              <Card className="p-4 space-y-3">
                <div className="flex gap-2">
                  {(['discussion', 'question', 'announcement'] as const).map((t) => (
                    <button key={t} type="button" onClick={() => setPostType(t)}
                      className={cn('px-3 py-1 rounded-lg text-xs font-medium border capitalize transition-colors',
                        postType === t ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-muted-foreground hover:text-foreground')}>
                      {t}
                    </button>
                  ))}
                </div>
                <Input placeholder="Post title..." value={postTitle} onChange={e => setPostTitle(e.target.value)} maxLength={200} />
                <Textarea placeholder="What's on your mind? Share with the club..." value={postContent}
                  onChange={e => setPostContent(e.target.value)} className="min-h-[100px] resize-none" />
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => { setShowPostForm(false); setPostTitle(''); setPostContent(''); }}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                  <Button size="sm" disabled={!postTitle.trim() || !postContent.trim() || createPostMutation.isPending}
                    onClick={handlePublishPost} className="gap-1.5">
                    <Send className="h-3.5 w-3.5" />
                    {createPostMutation.isPending ? 'Publishing...' : 'Publish'}
                  </Button>
                </div>
              </Card>
            )
          )}
          {postsLoading ? <InlineLoader /> : postsData?.data.length === 0 ? (
            <EmptyState icon={Users} title="No posts yet" description="Be the first to post in this club" />
          ) : (
            <div className="space-y-3">{postsData?.data.map((post) => <PostCard key={post._id} post={post} compact />)}</div>
          )}
        </Tabs.Content>

        {/* Members tab */}
        <Tabs.Content value="members" className="space-y-3">
          {membersLoading ? <InlineLoader /> : members.length === 0 ? (
            <EmptyState icon={Users} title="No members" description="No one has joined this club yet" />
          ) : (
            <div className="space-y-2">
              {members.map((m: { _id: string; role: 'member' | 'moderator' | 'owner'; joinedAt: string; user: { _id: string; username: string; displayName: string; avatarUrl?: string; isVerified?: boolean; email?: string } }) => (
                <div key={m._id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar user={m.user} size="sm" linkToProfile />
                    <div>
                      <p className="text-sm font-medium">{m.user.displayName}</p>
                      <p className="text-xs text-muted-foreground">@{m.user.username} · joined {formatRelativeTime(m.joinedAt)}</p>
                      {/* Email — clickable mailto link for all members */}
                      {m.user.email && (
                        <a
                          href={`mailto:${m.user.email}`}
                          className="text-xs text-primary/70 hover:text-primary transition-colors mt-0.5 block"
                          onClick={e => e.stopPropagation()}
                        >
                          {m.user.email}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.role === 'owner' && <Badge variant="secondary" className="text-[10px]">Owner</Badge>}
                    {m.role === 'moderator' && (
                      <Badge variant="secondary" className="text-[10px] text-blue-400 bg-blue-400/10 border-blue-400/20">
                        <Shield className="h-2.5 w-2.5 mr-1" />Mod
                      </Badge>
                    )}
                    {isFounder && m.role !== 'owner' && (
                      <Button size="sm" variant="ghost" disabled={promotingId === m.user._id}
                        onClick={() => handlePromote(m.user._id, m.role)} className="h-7 text-xs gap-1">
                        {m.role === 'moderator' ? <><ShieldOff className="h-3.5 w-3.5" /> Demote</> : <><Shield className="h-3.5 w-3.5" /> Promote</>}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Tabs.Content>

        {/* Championship tab */}
        <Tabs.Content value="championship" className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-3">Current Season</h3>
            {!currentSeason ? <p className="text-sm text-muted-foreground">No active championship season.</p>
              : scoreLoading ? <InlineLoader /> : (
              <Card className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{currentSeason.name}</p>
                  {clubScore?.rank != null && <Badge variant="secondary" className="font-bold">Rank #{clubScore.rank}</Badge>}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">{formatNumber(clubScore?.totalScore ?? 0)}</span>
                  <span className="text-sm text-muted-foreground">points</span>
                </div>
                {clubScore && clubScore.totalScore > 0 && (
                  <ScoreBreakdownBar breakdown={clubScore.breakdown ?? {}} totalScore={clubScore.totalScore} />
                )}
              </Card>
            )}
          </div>
          {endedSeasons.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Past Seasons</h3>
              <div className="space-y-2">
                {endedSeasons.map((season) => {
                  const topClub = season.topClubs?.find((tc) => (tc.club as { slug?: string })?.slug === slug || typeof tc.club === 'string');
                  return (
                    <div key={season._id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm">
                      <span className="font-medium">{season.name}</span>
                      {topClub ? (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{formatNumber(topClub.score)} pts</span>
                          <Badge variant="secondary">#{topClub.rank}</Badge>
                        </div>
                      ) : <span className="text-muted-foreground text-xs">Not ranked</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Tabs.Content>

        {/* Join Requests tab — club admin only */}
        {isClubAdmin && (
          <Tabs.Content value="requests" className="space-y-3">
            <p className="text-sm text-muted-foreground mb-1">
              {pendingCount > 0 ? `${pendingCount} pending request${pendingCount !== 1 ? 's' : ''}` : 'No pending requests'}
            </p>
            {joinRequestsLoading ? <InlineLoader /> : joinRequests.length === 0 ? (
              <EmptyState icon={UserCheck} title="All clear!" description="No pending join requests for this club." />
            ) : (
              <div className="space-y-3">
                {joinRequests.map((req) => (
                  <div key={req._id} className="flex items-start gap-4 rounded-xl border border-border px-4 py-3">
                    <UserAvatar user={req.user} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{req.user.displayName}</span>
                        <span className="text-xs text-muted-foreground">@{req.user.username} · {formatRelativeTime(req.createdAt)}</span>
                      </div>
                      {req.message && (
                        <p className="text-xs text-muted-foreground mt-1 italic bg-secondary/50 rounded px-2 py-1">"{req.message}"</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="sm" variant="outline" disabled={processingRequestId === req._id}
                        onClick={() => handleJoinRequest(req._id, 'accept')}
                        className="h-8 gap-1.5 border-green-500/30 text-green-500 hover:bg-green-500/10 hover:text-green-500">
                        <Check className="h-3.5 w-3.5" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" disabled={processingRequestId === req._id}
                        onClick={() => handleJoinRequest(req._id, 'reject')}
                        className="h-8 gap-1.5 border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-500">
                        <X className="h-3.5 w-3.5" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Tabs.Content>
        )}
      </Tabs.Root>
    </div>
  );
}
