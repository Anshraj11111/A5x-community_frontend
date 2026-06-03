import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users2, Globe, Lock, Search } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn, formatRelativeTime, formatNumber } from '@/lib/utils';
import { useToast } from '@/store/uiStore';
import api from '@/services/api';

export default function AdminClubsPage() {
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-clubs', search],
    queryFn: async () => {
      const params: Record<string, string> = { limit: '50' };
      if (search) params.search = search;
      const { data } = await api.get('/clubs', { params });
      return data;
    },
  });

  const clubs = data?.data || [];

  // Toggle privacy — use slug since club route uses slug, not _id
  const privacyMutation = useMutation({
    mutationFn: async ({ slug, isPrivate }: { slug: string; isPrivate: boolean }) => {
      await api.patch(`/clubs/${slug}`, { isPrivate });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clubs'] });
      success('Club updated');
    },
    onError: () => toastError('Failed to update club — only club owners/moderators can do this'),
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white">Product Clubs</h1>
        <p className="text-sm text-[#666] mt-0.5">{clubs.length} clubs loaded</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#444]" />
        <Input
          placeholder="Search clubs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 bg-[#0d0d0d] border-[#1a1a1a] text-white placeholder:text-[#444]"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5 animate-pulse h-32" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-6 text-center text-sm text-red-400">
          Failed to load clubs.
        </div>
      ) : clubs.length === 0 ? (
        <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-8 text-center">
          <Users2 className="h-8 w-8 text-[#444] mx-auto mb-3" />
          <p className="text-sm text-[#666]">No clubs found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map((club: any) => (
            <div
              key={club._id}
              className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5 hover:border-[#2a2a2a] transition-all">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  {club.iconUrl ? (
                    <img
                      src={club.iconUrl}
                      alt={club.name}
                      className="h-9 w-9 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-lg bg-indigo-400/10 flex items-center justify-center shrink-0">
                      <Users2 className="h-4 w-4 text-indigo-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{club.name}</p>
                    <p className="text-[10px] text-[#444]">/{club.slug}</p>
                  </div>
                </div>

                {/* Privacy toggle (requires being club owner — shown as info only) */}
                <div
                  title={club.isPrivate ? 'Private club' : 'Public club'}
                  className={cn(
                    'p-1.5 rounded-lg shrink-0',
                    club.isPrivate ? 'text-orange-400 bg-orange-400/10' : 'text-[#00FF88] bg-[#00FF88]/10'
                  )}>
                  {club.isPrivate ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                </div>
              </div>

              {club.description && (
                <p className="text-xs text-[#666] line-clamp-2 mb-3">{club.description}</p>
              )}

              <div className="flex items-center justify-between text-xs text-[#444]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Users2 className="h-3 w-3" />
                    {formatNumber(club.memberCount ?? 0)} members
                  </span>
                  <span className={cn(
                    'px-1.5 py-0.5 rounded-full text-[10px] font-semibold border',
                    club.isPrivate
                      ? 'text-orange-400 bg-orange-400/10 border-orange-400/20'
                      : 'text-[#00FF88] bg-[#00FF88]/10 border-[#00FF88]/20'
                  )}>
                    {club.isPrivate ? 'Private' : 'Public'}
                  </span>
                </div>
                <span>{formatRelativeTime(club.createdAt)}</span>
              </div>

              {club.owner && (
                <div className="mt-3 pt-3 border-t border-[#111] flex items-center gap-2">
                  <img
                    src={club.owner.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${club.owner.username}`}
                    alt=""
                    className="h-5 w-5 rounded-full"
                  />
                  <span className="text-[10px] text-[#444]">
                    Owner: <span className="text-[#666]">@{club.owner.username}</span>
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
