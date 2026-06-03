import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Flag, CheckCircle, XCircle } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { useToast } from '@/store/uiStore';
import api from '@/services/api';

const STATUS_COLORS: Record<string, string> = {
  pending:   'text-orange-400 bg-orange-400/10 border-orange-400/20',
  reviewed:  'text-blue-400 bg-blue-400/10 border-blue-400/20',
  resolved:  'text-[#00FF88] bg-[#00FF88]/10 border-[#00FF88]/20',
  dismissed: 'text-[#444] bg-[#111] border-[#222]',
};

const REASON_LABELS: Record<string, string> = {
  spam:           '🚫 Spam',
  harassment:     '⚠️ Harassment',
  misinformation: '❌ Misinformation',
  nsfw:           '🔞 NSFW',
  other:          '📋 Other',
};

const FILTERS = ['all', 'pending', 'reviewed', 'resolved', 'dismissed'];

export default function AdminReportsPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const [filter, setFilter] = useState('all');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-reports', filter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filter !== 'all') params.status = filter;
      const { data } = await api.get('/admin/reports', { params });
      return data;
    },
  });

  const reports: any[] = data?.data || [];
  const pendingCount = filter === 'all'
    ? reports.filter(r => r.status === 'pending').length
    : filter === 'pending' ? reports.length : 0;

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/admin/reports/${id}`, { status });
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      success(`Report ${status}`);
    },
    onError: () => toastError('Failed to update report'),
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white">Reports Center</h1>
        <p className="text-sm text-[#666] mt-0.5">
          {pendingCount > 0 ? `${pendingCount} pending review` : 'No pending reports'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-1 w-fit flex-wrap">
        {FILTERS.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              'px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
              filter === s ? 'bg-[#1a1a1a] text-white' : 'text-[#444] hover:text-white'
            )}>
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center text-[#444] text-sm py-8">Loading reports...</div>
      ) : isError ? (
        <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-6 text-center text-sm text-red-400">
          Failed to load reports. Check that the backend is running and you have admin access.
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-8 text-center">
          <Flag className="h-8 w-8 text-[#444] mx-auto mb-3" />
          <p className="text-sm text-[#666]">No reports found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report: any) => (
            <div
              key={report._id}
              className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5 hover:border-[#2a2a2a] transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-400/10 shrink-0 mt-0.5">
                    <Flag className="h-4 w-4 text-orange-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-semibold text-white capitalize">
                        {report.targetType}
                      </span>
                      <span className="text-[10px] text-orange-400">
                        {REASON_LABELS[report.reason] || report.reason}
                      </span>
                    </div>
                    <p className="text-xs text-[#444]">
                      Reported by @{report.reporter?.username || 'unknown'} ·{' '}
                      {formatRelativeTime(report.createdAt)}
                    </p>
                    {report.description && (
                      <p className="text-xs text-[#666] mt-1 max-w-md">{report.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn(
                    'text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize',
                    STATUS_COLORS[report.status] || STATUS_COLORS.pending
                  )}>
                    {report.status}
                  </span>
                  {report.status === 'pending' && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => updateMutation.mutate({ id: report._id, status: 'resolved' })}
                        disabled={updateMutation.isPending}
                        className="p-1.5 rounded-lg text-[#00FF88] hover:bg-[#00FF88]/10 transition-colors"
                        title="Resolve">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => updateMutation.mutate({ id: report._id, status: 'dismissed' })}
                        disabled={updateMutation.isPending}
                        className="p-1.5 rounded-lg text-[#444] hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        title="Dismiss">
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
