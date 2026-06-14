import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Lock, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { InlineLoader } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { clubService } from '@/services/clubService';
import { useToast } from '@/store/uiStore';
import { formatNumber } from '@/lib/utils';
import { QUERY_KEYS } from '@/lib/constants';
import type { IProductClub } from '@/types';

// Roles allowed to create clubs
const CAN_CREATE_CLUB = new Set(['founder', 'co_founder', 'admin']);

export default function ClubsPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.CLUBS, { search }],
    queryFn: () => clubService.getClubs({ search: search || undefined, limit: 30 }),
  });

  const canCreate = isAuthenticated && user && CAN_CREATE_CLUB.has(user.role);

  const handleRequestJoin = async (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    if (!isAuthenticated) { error('Sign in to join clubs'); return; }
    setLoadingSlug(slug);
    try {
      await clubService.requestJoin(slug);
      success(
        (data?.data.find((c: { slug: string; isPrivate?: boolean }) => c.slug === slug)?.isPrivate)
          ? 'Join request sent! Waiting for founder approval.'
          : 'Joined club successfully!'
      );
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLUBS] });
    } catch (err: unknown) {
      error(
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message || 'Failed to send request'
      );
    } finally {
      setLoadingSlug(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Product Clubs</h1>
          <p className="text-sm text-muted-foreground mt-1">Join communities around A5X products</p>
        </div>
        {/* Only founder / co_founder / admin can create */}
        {canCreate && (
          <Button size="sm" asChild>
            <Link to="/clubs/new"><Plus className="h-4 w-4 mr-1" /> Create Club</Link>
          </Button>
        )}
      </div>

      <Input
        placeholder="Search clubs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {isLoading ? (
        <InlineLoader />
      ) : data?.data.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clubs found"
          description="No clubs match your search"
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.data.map((club: IProductClub & { hasPendingRequest?: boolean }) => (
            <Link key={club._id} to={`/clubs/${club.slug}`}>
              <Card className="transition-all duration-200 hover:border-border/80 hover:bg-secondary/50 overflow-hidden cursor-pointer h-full flex flex-col">
                <div className="relative h-24 bg-gradient-to-br from-secondary to-background overflow-hidden">
                  {club.coverImage && (
                    <img src={club.coverImage} alt="" className="w-full h-full object-cover" />
                  )}
                  {club.isPrivate && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-[10px] gap-1">
                        <Lock className="h-2.5 w-2.5" /> Private
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-sm">{club.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 flex-1">
                    {club.description}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" /> {formatNumber(club.memberCount)} members
                    </span>

                    {/* ── Join state button ── */}
                    {club.isMember ? (
                      <Badge variant="default" className="text-[10px]">Joined</Badge>
                    ) : club.hasPendingRequest ? (
                      <Badge variant="secondary" className="text-[10px] gap-1 text-yellow-500 bg-yellow-500/10">
                        <Clock className="h-2.5 w-2.5" /> Pending
                      </Badge>
                    ) : isAuthenticated ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-3"
                        disabled={loadingSlug === club.slug}
                        onClick={(e) => handleRequestJoin(e, club.slug)}
                      >
                        {loadingSlug === club.slug
                          ? '...'
                          : club.isPrivate
                          ? 'Request to Join'
                          : 'Join'}
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="h-7 text-xs px-3" asChild>
                        <Link to="/login" onClick={(e) => e.stopPropagation()}>Join</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
