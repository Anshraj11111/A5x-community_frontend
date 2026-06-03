import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bug } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { useToast } from '@/store/uiStore';
import api from '@/services/api';

const BUG_STATUSES = ['reported', 'confirmed', 'investigating', 'fixed', 'released'];
const SEVERITIES   = ['low', 'medium', 'high', 'critical'];

const SEV_COLORS: Record<string, string> = {
  low:      'text-blue-400 bg-blue-400/10 border-blue-400/20',
  medium:   'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  high:     'text-orange-400 bg-orange-400/10 border-orange-400/20',
  critical: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const STATUS_COLORS: Record<string, string> = {
  reported:      'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  confirmed:     'text-orange-400 bg-orange-400/10 border-orange-400/20',
  investigating: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  fixed:         'text-[#00FF88] bg-[#00FF88]/10 border-[#00FF88]/20',
  released:      'text-[#00FF88] bg-[#00FF88]/10 border-[#00FF88]/20',
};

export default function AdminBugsPage() {
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();
  const [sevFilter, setSevFilter] = useState('all');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-bugs', sevFilter],
    queryFn: async () => {
      const params: Record<string, string> = { limit: '50' };
      if (sevFilter !== 'all') params.severity = sevFilter;
      const { data } = await api.get('/bugs', { params });
      return data;
    },
  });

  const bugs = data?.data || [];

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/bugs/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bugs'] });
      success('Bug status updated');
    },
    onError: () => toastError('Failed to update bug status'),
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white">Bug Management</h1>
        <p className="text-sm text-[#666] mt-0.5">{bugs.length} reports loaded</p>
      </div>

      {/* Severity filter */}
      <div className="flex gap-1 bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-1 w-fit">
        {['all', ...SEVERITIES].map(s => (
          <button
            key={s}
            onClick={() => setSevFilter(s)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
              sevFilter === s ? 'bg-[#1a1a1a] text-white' : 'text-[#444] hover:text-white'
            )}>
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-6 text-center text-sm text-red-400">
          Failed to load bug reports. Check your backend connection.
        </div>
      ) : bugs.length === 0 ? (
        <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-8 text-center">
          <Bug className="h-8 w-8 text-[#444] mx-auto mb-3" />
          <p className="text-sm text-[#666]">No bug reports found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bugs.map((bug: any) => (
            <div
              key={bug._id}
              className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5 hover:border-[#2a2a2a] transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-sm font-semibold text-white">{bug.title}</h3>
                    <span className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize',
                      SEV_COLORS[bug.severity] || SEV_COLORS.low
                    )}>
                      {bug.severity}
                    </span>
                    <span className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize',
                      STATUS_COLORS[bug.status] || STATUS_COLORS.reported
                    )}>
                      {bug.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#666] line-clamp-2">{bug.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[#444]">
                    <span>by {bug.reporter?.displayName ?? 'Unknown'}</span>
                    <span>{formatRelativeTime(bug.createdAt)}</span>
                  </div>
                </div>
                <select
                  value={bug.status}
                  onChange={e => updateMutation.mutate({ id: bug._id, status: e.target.value })}
                  disabled={updateMutation.isPending}
                  className="h-8 rounded-lg border border-[#1a1a1a] bg-[#111] px-2 text-xs text-white focus:outline-none shrink-0 cursor-pointer">
                  {BUG_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
