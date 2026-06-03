import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pin, Lock, Trash2, Eye } from 'lucide-react';
import { cn, formatRelativeTime, formatNumber } from '@/lib/utils';
import { useToast } from '@/store/uiStore';
import api from '@/services/api';

type ContentTab = 'discussions' | 'features' | 'bugs' | 'showcase';

export default function AdminContentPage() {
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<ContentTab>('discussions');

  const TABS: { id: ContentTab; label: string; endpoint: string }[] = [
    { id: 'discussions', label: 'Discussions',     endpoint: '/posts' },
    { id: 'features',    label: 'Feature Requests', endpoint: '/features' },
    { id: 'bugs',        label: 'Bug Reports',      endpoint: '/bugs' },
    { id: 'showcase',    label: 'Showcase',         endpoint: '/showcase' },
  ];

  const activeTab = TABS.find(t => t.id === tab)!;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-content', tab],
    queryFn: async () => {
      const { data } = await api.get(activeTab.endpoint, { params: { limit: 20 } });
      return data;
    },
  });

  const items = data?.data || [];

  const pinMutation = useMutation({
    mutationFn: (id: string) => api.post(`/posts/${id}/pin`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-content', 'discussions'] });
      success('Post pin status toggled');
    },
    onError: () => toastError('Failed to pin post'),
  });

  const lockMutation = useMutation({
    mutationFn: (id: string) => api.post(`/posts/${id}/lock`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-content', 'discussions'] });
      success('Post lock status toggled');
    },
    onError: () => toastError('Failed to lock post'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`${activeTab.endpoint}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-content', tab] });
      success('Item deleted');
    },
    onError: () => toastError('Failed to delete item'),
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white">Content Moderation</h1>
        <p className="text-sm text-[#666] mt-0.5">Review and manage all community content</p>
      </div>

      <div className="flex gap-1 bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-1 w-fit">
        {TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={cn('px-4 py-1.5 rounded-lg text-xs font-medium transition-all',
              tab === id ? 'bg-[#1a1a1a] text-white' : 'text-[#444] hover:text-white')}>
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center text-[#444] text-sm py-8">Loading...</div>
      ) : (
        <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                {['Title', 'Author', 'Score', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-[#444] uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111]">
              {items.map((item: any) => (
                <tr key={item._id} className="hover:bg-[#111] transition-colors">
                  <td className="px-4 py-3 max-w-xs">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-white truncate">{item.title || item.description?.slice(0, 60)}</p>
                      {item.isPinned && (
                        <span className="text-[9px] font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-1 py-0.5 rounded shrink-0">
                          PINNED
                        </span>
                      )}
                      {item.isLocked && (
                        <span className="text-[9px] font-bold text-blue-400 bg-blue-400/10 border border-blue-400/20 px-1 py-0.5 rounded shrink-0">
                          LOCKED
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-[#888]">
                      {item.author?.displayName || item.reporter?.displayName || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#888] tabular-nums">
                    {formatNumber(item.voteScore ?? item.voteCount ?? 0)}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#444]">{formatRelativeTime(item.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {/* View */}
                      <a
                        href={tab === 'discussions' ? `/discussions/${item._id}` : `/${tab}`}
                        target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-[#444] hover:text-[#00FF88] hover:bg-[#00FF88]/10 transition-colors"
                        title="View">
                        <Eye className="h-3.5 w-3.5" />
                      </a>

                      {/* Pin / Lock — discussions only */}
                      {tab === 'discussions' && (
                        <>
                          <button
                            onClick={() => pinMutation.mutate(item._id)}
                            disabled={pinMutation.isPending}
                            className={cn(
                              'p-1.5 rounded-lg transition-colors',
                              item.isPinned
                                ? 'text-yellow-400 bg-yellow-400/10'
                                : 'text-[#444] hover:text-yellow-400 hover:bg-yellow-400/10'
                            )}
                            title={item.isPinned ? 'Unpin' : 'Pin'}>
                            <Pin className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => lockMutation.mutate(item._id)}
                            disabled={lockMutation.isPending}
                            className={cn(
                              'p-1.5 rounded-lg transition-colors',
                              item.isLocked
                                ? 'text-blue-400 bg-blue-400/10'
                                : 'text-[#444] hover:text-blue-400 hover:bg-blue-400/10'
                            )}
                            title={item.isLocked ? 'Unlock' : 'Lock'}>
                            <Lock className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this item?')) {
                            deleteMutation.mutate(item._id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 rounded-lg text-[#444] hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <div className="p-8 text-center text-[#444] text-sm">No content found</div>
          )}
        </div>
      )}
    </div>
  );
}
