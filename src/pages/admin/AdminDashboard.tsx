import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Users, MessageSquare, Lightbulb, Bug, Users2, AlertTriangle,
  UserPlus, Activity,
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { useAdminStore } from '@/store/adminStore';
import api from '@/services/api';
import { QUERY_KEYS } from '@/lib/constants';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
  change?: string;
  changeUp?: boolean;
}

function StatCard({ label, value, icon: Icon, color, bg, change, changeUp }: StatCardProps) {
  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5 hover:border-[#2a2a2a] transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-[#666] font-medium">{label}</p>
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', bg)}>
          <Icon className={cn('h-4 w-4', color)} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white tabular-nums">
        {typeof value === 'number' ? formatNumber(value) : value}
      </p>
      {change && (
        <p className={cn('text-xs mt-1', changeUp ? 'text-[#00FF88]' : 'text-red-400')}>
          {changeUp ? '↑' : '↓'} {change}
        </p>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { adminUser } = useAdminStore();

  const { data: stats, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.STATS],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats');
      return data.data;
    },
  });

  const s = stats || {};

  const statCards: StatCardProps[] = [
    { label: 'Total Users',      value: s.totalUsers      ?? '—', icon: Users,         color: 'text-blue-400',    bg: 'bg-blue-400/10',    change: s.newUsersToday ? `+${s.newUsersToday} today` : undefined, changeUp: true },
    { label: 'New Today',        value: s.newUsersToday   ?? '—', icon: UserPlus,      color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Total Posts',      value: s.totalPosts      ?? '—', icon: MessageSquare, color: 'text-purple-400',  bg: 'bg-purple-400/10' },
    { label: 'Total Comments',   value: s.totalComments   ?? '—', icon: Activity,      color: 'text-[#00FF88]',   bg: 'bg-[#00FF88]/10' },
    { label: 'Feature Requests', value: s.totalFeatures   ?? '—', icon: Lightbulb,     color: 'text-yellow-400',  bg: 'bg-yellow-400/10' },
    { label: 'Bug Reports',      value: s.totalBugs       ?? '—', icon: Bug,           color: 'text-red-400',     bg: 'bg-red-400/10' },
    { label: 'Product Clubs',    value: s.totalClubs      ?? '—', icon: Users2,        color: 'text-indigo-400',  bg: 'bg-indigo-400/10' },
    { label: 'Pending Reports',  value: s.pendingReports  ?? '—', icon: AlertTriangle, color: 'text-orange-400',  bg: 'bg-orange-400/10', change: (s.pendingReports ?? 0) > 0 ? 'Needs review' : undefined, changeUp: false },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good {greeting},{' '}
            <span className="text-[#00FF88]">{adminUser?.name.split(' ')[0] ?? 'Admin'}</span>
          </h1>
          <p className="text-sm text-[#666] mt-1">Here's what's happening in A5X Community right now.</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#666]">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-xs text-[#00FF88] mt-0.5">
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {statCards.map(stat => <StatCard key={stat.label} {...stat} />)}
        </div>
      )}

      {/* Quick actions */}
      <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {([
            { label: 'Review Reports',  to: '/admin/reports',       color: 'text-orange-400', count: s.pendingReports },
            { label: 'Manage Users',    to: '/admin/users',         color: 'text-blue-400',   count: null },
            { label: 'Update Features', to: '/admin/features',      color: 'text-yellow-400', count: null },
            { label: 'Manage Bugs',     to: '/admin/bugs',          color: 'text-red-400',    count: null },
            { label: 'Manage Clubs',    to: '/admin/clubs',         color: 'text-indigo-400', count: null },
            { label: 'Analytics',       to: '/admin/analytics',     color: 'text-[#00FF88]',  count: null },
          ] as const).map(({ label, to, color, count }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center justify-between p-3 rounded-lg border border-[#1a1a1a] hover:border-[#2a2a2a] hover:bg-[#111] transition-all">
              <span className={cn('text-xs font-medium', color)}>{label}</span>
              {count != null && count > 0 && (
                <span className="text-[10px] font-bold bg-orange-400/10 text-orange-400 border border-orange-400/20 px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
