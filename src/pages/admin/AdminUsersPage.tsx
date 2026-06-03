import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Search, Ban, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn, formatRelativeTime, formatNumber } from '@/lib/utils';
import { useToast } from '@/store/uiStore';
import api from '@/services/api';
import { QUERY_KEYS } from '@/lib/constants';

const ROLE_COLORS: Record<string, string> = {
  user:      'text-[#666] bg-[#111] border-[#222]',
  moderator: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  admin:     'text-blue-400 bg-blue-400/10 border-blue-400/20',
};

export default function AdminUsersPage() {
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.STATS, 'admin-users', search, roleFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (roleFilter !== 'all') params.role = roleFilter;
      const { data } = await api.get('/admin/users', { params });
      return data;
    },
  });

  const users = data?.data || [];

  const banMutation = useMutation({
    mutationFn: async ({ id, ban }: { id: string; ban: boolean }) => {
      await api.patch(`/admin/users/${id}/ban`, { ban, reason: ban ? 'Banned by admin' : undefined });
    },
    onSuccess: (_, { ban }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STATS, 'admin-users'] });
      success(ban ? 'User banned' : 'User unbanned');
    },
    onError: () => toastError('Failed to update user status'),
  });

  const roleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      await api.patch(`/admin/users/${id}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STATS, 'admin-users'] });
      success('Role updated');
    },
    onError: () => toastError('Failed to update role'),
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">User Management</h1>
          <p className="text-sm text-[#666] mt-0.5">{users.length} users loaded</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#444]" />
          <Input
            placeholder="Search by name, username, or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-[#0d0d0d] border-[#1a1a1a] text-white placeholder:text-[#444]"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="h-9 rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] px-3 text-sm text-white focus:outline-none">
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-8 text-center text-[#444] text-sm">
          Loading users...
        </div>
      ) : (
        <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                {['User', 'Role', 'Reputation', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-[#444] uppercase tracking-wider px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111]">
              {users.map((user: any) => (
                <tr key={user._id} className={cn('hover:bg-[#111] transition-colors', user.isBanned && 'opacity-60')}>
                  {/* User info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                        alt=""
                        className="h-8 w-8 rounded-full shrink-0"
                      />
                      <div>
                        <p className="text-sm font-medium text-white">{user.displayName}</p>
                        <p className="text-xs text-[#444]">@{user.username}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role select */}
                  <td className="px-4 py-3">
                    <div className="relative inline-flex items-center gap-1">
                      <select
                        value={user.role}
                        onChange={e => roleMutation.mutate({ id: user._id, role: e.target.value })}
                        disabled={roleMutation.isPending}
                        className={cn(
                          'appearance-none text-[10px] font-semibold px-2 py-0.5 pr-5 rounded-full border cursor-pointer bg-transparent focus:outline-none',
                          ROLE_COLORS[user.role] || ROLE_COLORS.user
                        )}>
                        <option value="user">user</option>
                        <option value="moderator">moderator</option>
                        <option value="admin">admin</option>
                      </select>
                      <ChevronDown className="h-2.5 w-2.5 absolute right-1 pointer-events-none text-current" />
                    </div>
                  </td>

                  <td className="px-4 py-3 text-sm text-[#888] tabular-nums">
                    {formatNumber(user.reputation ?? 0)}
                  </td>

                  <td className="px-4 py-3 text-xs text-[#444]">
                    {formatRelativeTime(user.createdAt)}
                  </td>

                  {/* Ban status badge */}
                  <td className="px-4 py-3">
                    <span className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                      user.isBanned
                        ? 'text-red-400 bg-red-400/10 border-red-400/20'
                        : 'text-[#00FF88] bg-[#00FF88]/10 border-[#00FF88]/20'
                    )}>
                      {user.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </td>

                  {/* Ban / Unban action */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => banMutation.mutate({ id: user._id, ban: !user.isBanned })}
                      disabled={banMutation.isPending}
                      className={cn(
                        'p-1.5 rounded-lg transition-colors',
                        user.isBanned
                          ? 'text-[#00FF88] hover:bg-[#00FF88]/10'
                          : 'text-orange-400 hover:bg-orange-400/10'
                      )}
                      title={user.isBanned ? 'Unban user' : 'Ban user'}>
                      <Ban className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="p-8 text-center text-[#444] text-sm">No users found</div>
          )}
        </div>
      )}
    </div>
  );
}
