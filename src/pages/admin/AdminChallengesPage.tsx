import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trophy, Plus, Trash2, Eye, EyeOff, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn, formatRelativeTime, formatNumber } from '@/lib/utils';
import { useToast } from '@/store/uiStore';
import api from '@/services/api';

// Challenges are stored as posts with category 'challenge'
const CHALLENGE_CATEGORY = 'challenge';

const EMPTY_FORM = {
  title:    '',
  body:     '',
  category: CHALLENGE_CATEGORY as const,
};

export default function AdminChallengesPage() {
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-challenges'],
    queryFn: async () => {
      const { data } = await api.get('/posts', {
        params: { category: CHALLENGE_CATEGORY, limit: 20 },
      });
      return data;
    },
  });

  const challenges = data?.data || [];

  const createMutation = useMutation({
    mutationFn: async (payload: typeof form) => {
      const { data } = await api.post('/posts', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      success('Challenge created');
      setForm(EMPTY_FORM);
      setShowForm(false);
    },
    onError: () => toastError('Failed to create challenge'),
  });

  const pinMutation = useMutation({
    mutationFn: (id: string) => api.post(`/posts/${id}/pin`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      success('Pin toggled');
    },
    onError: () => toastError('Failed to pin challenge'),
  });

  const lockMutation = useMutation({
    mutationFn: (id: string) => api.post(`/posts/${id}/lock`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      success('Lock toggled');
    },
    onError: () => toastError('Failed to lock challenge'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/posts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      success('Challenge deleted');
    },
    onError: () => toastError('Failed to delete challenge'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    createMutation.mutate(form);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Challenges</h1>
          <p className="text-sm text-[#666] mt-0.5">
            {challenges.length} active challenge{challenges.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowForm(v => !v)}
          className="bg-[#00FF88] text-black hover:bg-[#00FF88]/90 gap-1.5">
          {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showForm ? 'Cancel' : 'New Challenge'}
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="rounded-xl border border-[#00FF88]/20 bg-[#0d0d0d] p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Create Challenge</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#888]">Challenge Title</label>
              <Input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Build the fastest RC Bot — Week 3"
                required
                className="bg-[#111] border-[#1a1a1a] text-white placeholder:text-[#444]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#888]">Description & Rules</label>
              <Textarea
                value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                placeholder="Describe the challenge, rules, prizes, and deadline..."
                required
                className="bg-[#111] border-[#1a1a1a] text-white placeholder:text-[#444] min-h-[120px]"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={createMutation.isPending}
              className="bg-[#00FF88] text-black hover:bg-[#00FF88]/90">
              {createMutation.isPending ? 'Creating...' : 'Launch Challenge'}
            </Button>
          </form>
        </div>
      )}

      {/* Challenges list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5 animate-pulse h-28" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-6 text-center text-sm text-red-400">
          Failed to load challenges.
        </div>
      ) : challenges.length === 0 ? (
        <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-8 text-center">
          <Trophy className="h-8 w-8 text-[#444] mx-auto mb-3" />
          <p className="text-sm text-white mb-1">No challenges yet</p>
          <p className="text-xs text-[#666]">Launch the first challenge to engage the community.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {challenges.map((challenge: any) => (
            <div
              key={challenge._id}
              className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5 hover:border-[#2a2a2a] transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg shrink-0 mt-0.5',
                    challenge.isPinned ? 'bg-yellow-400/10' : 'bg-yellow-400/5'
                  )}>
                    <Trophy className={cn(
                      'h-4 w-4',
                      challenge.isPinned ? 'text-yellow-400' : 'text-[#444]'
                    )} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-sm font-semibold text-white truncate">{challenge.title}</h3>
                      {challenge.isPinned && (
                        <span className="text-[9px] font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-1.5 py-0.5 rounded shrink-0">
                          PINNED
                        </span>
                      )}
                      {challenge.isLocked && (
                        <span className="text-[9px] font-bold text-[#444] bg-[#111] border border-[#222] px-1.5 py-0.5 rounded shrink-0">
                          ENDED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#666] line-clamp-2">{challenge.body}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#444]">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(challenge.createdAt)}
                      </span>
                      <span>💬 {formatNumber(challenge.commentCount ?? 0)} comments</span>
                      <span>👍 {formatNumber(challenge.voteScore ?? 0)} votes</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Pin */}
                  <button
                    onClick={() => pinMutation.mutate(challenge._id)}
                    disabled={pinMutation.isPending}
                    title={challenge.isPinned ? 'Unpin' : 'Pin to top'}
                    className={cn(
                      'p-1.5 rounded-lg transition-colors',
                      challenge.isPinned
                        ? 'text-yellow-400 bg-yellow-400/10'
                        : 'text-[#444] hover:text-yellow-400 hover:bg-yellow-400/10'
                    )}>
                    <Trophy className="h-3.5 w-3.5" />
                  </button>

                  {/* Lock (end challenge) */}
                  <button
                    onClick={() => lockMutation.mutate(challenge._id)}
                    disabled={lockMutation.isPending}
                    title={challenge.isLocked ? 'Reopen' : 'End challenge'}
                    className={cn(
                      'p-1.5 rounded-lg transition-colors',
                      challenge.isLocked
                        ? 'text-blue-400 bg-blue-400/10'
                        : 'text-[#444] hover:text-blue-400 hover:bg-blue-400/10'
                    )}>
                    {challenge.isLocked ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this challenge?')) deleteMutation.mutate(challenge._id);
                    }}
                    disabled={deleteMutation.isPending}
                    title="Delete"
                    className="p-1.5 rounded-lg text-[#444] hover:text-red-400 hover:bg-red-400/10 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
