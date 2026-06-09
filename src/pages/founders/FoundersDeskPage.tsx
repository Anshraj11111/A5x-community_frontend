import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Zap, ArrowUp, MessageSquare, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RoleBadge } from '@/components/common/RoleBadge';
import { UserAvatar } from '@/components/common/UserAvatar';
import { cn, formatRelativeTime, formatNumber } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/store/uiStore';
import api from '@/services/api';

const TYPE_COLORS: Record<string, string> = {
  feature:     'text-[#00FF88] bg-[#00FF88]/10 border-[#00FF88]/20',
  bugfix:      'text-red-400 bg-red-400/10 border-red-400/20',
  improvement: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  breaking:    'text-orange-400 bg-orange-400/10 border-orange-400/20',
};

// ── Single update card with comments ─────────────────────────────────────────
function UpdateCard({ update }: { update: any }) {
  const { user, isAuthenticated } = useAuthStore();
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  // Fetch comments for this update
  const { data: commentsData, isLoading: loadingComments } = useQuery({
    queryKey: ['update-comments', update._id],
    queryFn: async () => {
      const res = await api.get(`/updates/${update._id}/comments`);
      return res.data;
    },
    enabled: showComments,
  });

  const comments: any[] = commentsData?.data ?? [];

  // React (upvote) mutation
  const reactMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/updates/${update._id}/react`);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['founder-updates'] }),
    onError: () => toastError('Failed to react'),
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await api.post(`/updates/${update._id}/comments`, { content });
      return res.data;
    },
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['update-comments', update._id] });
      queryClient.invalidateQueries({ queryKey: ['founder-updates'] });
      success('Comment posted');
    },
    onError: () => toastError('Failed to post comment'),
  });

  const hasReacted = update.reactions?.includes(user?._id);

  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] overflow-hidden">
      {/* Update content */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono text-[#666] border border-[#222] px-1.5 py-0.5 rounded">
              {update.version}
            </span>
            <span className={cn(
              'text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize',
              TYPE_COLORS[update.type] || TYPE_COLORS.feature
            )}>
              {update.type}
            </span>
          </div>
          <span className="text-[10px] text-[#444] shrink-0">{formatRelativeTime(update.createdAt)}</span>
        </div>

        <h2 className="text-base font-bold text-white mb-2">{update.title}</h2>
        <p className="text-sm text-[#888] leading-relaxed whitespace-pre-wrap">{update.content}</p>

        {/* Images */}
        {update.images?.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            {update.images.map((img: string, i: number) => (
              <img key={i} src={img} alt="" className="rounded-lg w-full object-cover max-h-48" />
            ))}
          </div>
        )}

        {/* Author */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#1a1a1a]">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#00FF88] to-emerald-500 flex items-center justify-center shrink-0">
            <Zap className="h-3 w-3 text-black" />
          </div>
          <span className="text-xs text-[#666]">
            <span className="text-[#888] font-medium">{update.author?.displayName ?? 'A5X Team'}</span>
          </span>
          <RoleBadge role={update.author?.role ?? 'founder'} size="xs" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-3">
          {/* React button */}
          {isAuthenticated ? (
            <button
              onClick={() => reactMutation.mutate()}
              disabled={reactMutation.isPending}
              className={cn(
                'flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors',
                hasReacted
                  ? 'text-[#00FF88] bg-[#00FF88]/10'
                  : 'text-[#555] hover:text-[#00FF88] hover:bg-[#00FF88]/10'
              )}>
              <ArrowUp className="h-3.5 w-3.5" />
              {(update.reactions?.length || 0) > 0 && formatNumber(update.reactions.length)}
              {(update.reactions?.length || 0) === 0 && 'React'}
            </button>
          ) : (
            <span className="flex items-center gap-1 text-xs text-[#444]">
              <ArrowUp className="h-3.5 w-3.5" />
              {formatNumber(update.reactions?.length || 0)}
            </span>
          )}

          {/* Comments toggle */}
          <button
            onClick={() => setShowComments(v => !v)}
            className="flex items-center gap-1.5 text-xs text-[#555] hover:text-[#888] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-[#111]">
            <MessageSquare className="h-3.5 w-3.5" />
            {formatNumber(update.commentCount || 0)} Comments
            {showComments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-[#1a1a1a] bg-[#080808] p-4 space-y-4">
          {/* Comment input */}
          {isAuthenticated ? (
            <div className="flex gap-2">
              <Textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="bg-[#111] border-[#1a1a1a] text-white placeholder:text-[#444] text-xs min-h-[60px] resize-none"
              />
              <Button
                size="sm"
                onClick={() => { if (commentText.trim()) commentMutation.mutate(commentText.trim()); }}
                disabled={commentMutation.isPending || !commentText.trim()}
                className="bg-[#00FF88] text-black hover:bg-[#00FF88]/90 shrink-0 self-end">
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <p className="text-xs text-[#444] text-center py-2">Sign in to comment</p>
          )}

          {/* Comments list */}
          {loadingComments ? (
            <div className="text-xs text-[#444] text-center py-2">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-xs text-[#444] text-center py-2">No comments yet. Be the first!</div>
          ) : (
            <div className="space-y-3">
              {comments.map((c: any) => (
                <div key={c._id} className="flex gap-2">
                  <UserAvatar user={c.author} size="xs" className="shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-medium text-white">{c.author?.displayName}</span>
                      <RoleBadge role={c.author?.role} size="xs" />
                      <span className="text-[10px] text-[#444]">{formatRelativeTime(c.createdAt)}</span>
                    </div>
                    <p className="text-xs text-[#888] leading-relaxed">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function FoundersDeskPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['founder-updates'],
    queryFn: async () => {
      const res = await api.get('/updates', { params: { limit: 20 } });
      return res.data;
    },
  });

  const updates: any[] = Array.isArray(data?.data)
    ? data.data.filter((u: any) => u.isPublished)
    : [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-3 pb-2">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00FF88]/10 border border-[#00FF88]/20">
            <Zap className="h-7 w-7 text-[#00FF88]" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Founder's Desk</h1>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Direct updates from the A5X founders — roadmap, changelogs, and behind-the-scenes.
        </p>
      </div>

      {/* Updates */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5 animate-pulse h-40" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Failed to load updates.
        </div>
      ) : updates.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <Zap className="h-10 w-10 text-[#333] mx-auto" />
          <p className="text-sm text-muted-foreground">No updates yet. Check back soon.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {updates.map((update: any) => (
            <UpdateCard key={update._id} update={update} />
          ))}
        </div>
      )}
    </div>
  );
}
