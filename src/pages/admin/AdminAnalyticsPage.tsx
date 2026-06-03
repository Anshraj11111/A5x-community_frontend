import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Users, MessageSquare, Bug, Lightbulb, Flag, Users2 } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import api from '@/services/api';
import { QUERY_KEYS } from '@/lib/constants';

interface MetricCardProps {
  label: string;
  value: number | undefined;
  icon: React.ElementType;
  color: string;
  bg: string;
}

function MetricCard({ label, value, icon: Icon, color, bg }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-[#666] font-medium">{label}</p>
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', bg)}>
          <Icon className={cn('h-4 w-4', color)} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white tabular-nums">
        {value != null ? formatNumber(value) : '—'}
      </p>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEYS.STATS, 'analytics'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats');
      return data.data;
    },
  });

  const s = data || {};

  const metrics: MetricCardProps[] = [
    { label: 'Total Users',      value: s.totalUsers,     icon: Users,         color: 'text-blue-400',    bg: 'bg-blue-400/10' },
    { label: 'New Today',        value: s.newUsersToday,  icon: TrendingUp,    color: 'text-[#00FF88]',   bg: 'bg-[#00FF88]/10' },
    { label: 'Total Posts',      value: s.totalPosts,     icon: MessageSquare, color: 'text-purple-400',  bg: 'bg-purple-400/10' },
    { label: 'Comments',         value: s.totalComments,  icon: MessageSquare, color: 'text-indigo-400',  bg: 'bg-indigo-400/10' },
    { label: 'Feature Requests', value: s.totalFeatures,  icon: Lightbulb,     color: 'text-yellow-400',  bg: 'bg-yellow-400/10' },
    { label: 'Bug Reports',      value: s.totalBugs,      icon: Bug,           color: 'text-red-400',     bg: 'bg-red-400/10' },
    { label: 'Product Clubs',    value: s.totalClubs,     icon: Users2,        color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Pending Reports',  value: s.pendingReports, icon: Flag,          color: 'text-orange-400',  bg: 'bg-orange-400/10' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-[#666] mt-0.5">Platform performance overview</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-6 text-center text-sm text-red-400">
          Failed to load stats. Check your backend connection.
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map(m => <MetricCard key={m.label} {...m} />)}
        </div>
      )}

      {/* Placeholder for future charts */}
      <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-8 text-center">
        <TrendingUp className="h-8 w-8 text-[#444] mx-auto mb-3" />
        <p className="text-sm font-medium text-white mb-1">Growth Charts</p>
        <p className="text-xs text-[#666]">Detailed time-series analytics coming soon.</p>
      </div>
    </div>
  );
}
