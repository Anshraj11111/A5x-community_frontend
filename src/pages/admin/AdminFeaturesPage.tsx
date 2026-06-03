import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Lightbulb } from 'lucide-react';
import { cn, formatRelativeTime, formatNumber } from '@/lib/utils';
import { useToast } from '@/store/uiStore';
import api from '@/services/api';

const STATUSES = ['open', 'under_review', 'planned', 'in_development', 'released', 'rejected'];

const STATUS_COLORS: Record<string, string> = {
  open:           'text-[#00FF88] bg-[#00FF88]/10 border-[#00FF88]/20',
  under_review:   'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  planned:        'text-blue-400 bg-blue-400/10 border-blue-400/20',
  in_development: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  released:       'text-[#00FF88] bg-[#00FF88]/10 border-[#00FF88]/20',
  rejected:       'text-red-400 bg-red-400/10 border-red-400/20',
};

export default function AdminFeaturesPage() {
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-features'],
    queryFn: async () => {
      const { data } = await api.get('/features', { params: { limit: 50 } });
      return data;
    },
  });

  const features = data?.data || [];

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, adminNote }: { id: string; status: string; adminNote?: string }) => {
      await api.patch(`/features/${id}/status`, { status, adminNote });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-features'] });
      success('Feature updated');
      setEditingId(null);
    },
    onError: () => toastError('Failed to update feature'),
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white">Feature Requests</h1>
        <p className="text-sm text-[#666] mt-0.5">{features.length} total requests</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-6 text-center text-sm text-red-400">
          Failed to load features. Check your backend connection.
        </div>
      ) : features.length === 0 ? (
        <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-8 text-center">
          <Lightbulb className="h-8 w-8 text-[#444] mx-auto mb-3" />
          <p className="text-sm text-[#666]">No feature requests yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {features.map((feat: any) => (
            <div key={feat._id} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5 hover:border-[#2a2a2a] transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-sm font-semibold text-white">{feat.title}</h3>
                    <span className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                      STATUS_COLORS[feat.status] || STATUS_COLORS.open
                    )}>
                      {feat.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-[#666] line-clamp-2">{feat.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[#444]">
                    <span>👍 {formatNumber(feat.voteCount ?? 0)} votes</span>
                    <span>by {feat.author?.displayName ?? 'Unknown'}</span>
                    <span>{formatRelativeTime(feat.createdAt)}</span>
                  </div>
                  {feat.adminNote && (
                    <div className="mt-2 p-2 rounded-lg bg-[#00FF88]/5 border border-[#00FF88]/10">
                      <p className="text-[10px] text-[#00FF88]">📝 {feat.adminNote}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <select
                    value={feat.status}
                    onChange={e => updateMutation.mutate({ id: feat._id, status: e.target.value, adminNote: feat.adminNote })}
                    disabled={updateMutation.isPending}
                    className="h-8 rounded-lg border border-[#1a1a1a] bg-[#111] px-2 text-xs text-white focus:outline-none cursor-pointer">
                    {STATUSES.map(s => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      if (editingId === feat._id) {
                        setEditingId(null);
                      } else {
                        setEditingId(feat._id);
                        setEditNote(feat.adminNote || '');
                      }
                    }}
                    className="text-xs text-[#444] hover:text-[#00FF88] transition-colors text-right">
                    {editingId === feat._id ? 'Cancel' : '+ Note'}
                  </button>
                </div>
              </div>

              {editingId === feat._id && (
                <div className="mt-3 flex gap-2">
                  <input
                    value={editNote}
                    onChange={e => setEditNote(e.target.value)}
                    placeholder="Add admin note for this feature..."
                    className="flex-1 h-8 rounded-lg border border-[#1a1a1a] bg-[#111] px-3 text-xs text-white placeholder:text-[#444] focus:outline-none focus:border-[#00FF88]/40"
                  />
                  <button
                    onClick={() => updateMutation.mutate({ id: feat._id, status: feat.status, adminNote: editNote })}
                    disabled={updateMutation.isPending}
                    className="px-3 h-8 rounded-lg bg-[#00FF88] text-black text-xs font-semibold disabled:opacity-50">
                    Save
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
