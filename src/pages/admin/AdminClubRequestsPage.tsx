import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { UserAvatar } from '@/components/common/UserAvatar';
import { InlineLoader } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { clubService } from '@/services/clubService';
import { useToast } from '@/store/uiStore';
import { formatRelativeTime } from '@/lib/utils';

interface JoinRequest {
  _id: string;
  user: {
    _id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    isVerified?: boolean;
  };
  club: {
    _id: string;
    name: string;
    slug: string;
  };
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export default function AdminClubRequestsPage() {
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['club-join-requests', 'all-pending'],
    queryFn: () => clubService.getAllPendingRequests({ limit: 50 }),
  });
  const requests: JoinRequest[] = data?.data ?? [];

  const handle = async (req: JoinRequest, action: 'accept' | 'reject') => {
    setProcessingId(req._id);
    try {
      await clubService.handleJoinRequest(req.club.slug, req._id, action);
      success(action === 'accept' ? `${req.user.displayName} added to ${req.club.name}` : 'Request rejected');
      queryClient.invalidateQueries({ queryKey: ['club-join-requests'] });
    } catch (err: unknown) {
      error(
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message || 'Action failed'
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Club Join Requests</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and approve membership requests from users
        </p>
      </div>

      {isLoading ? (
        <InlineLoader />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No pending requests"
          description="All caught up! No club join requests waiting for review."
        />
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req._id} className="p-4">
              <div className="flex items-start gap-4">
                {/* User info */}
                <UserAvatar user={req.user} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{req.user.displayName}</span>
                    <span className="text-xs text-muted-foreground">@{req.user.username}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{formatRelativeTime(req.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-muted-foreground">wants to join</span>
                    <Badge variant="secondary" className="text-xs">{req.club.name}</Badge>
                  </div>
                  {req.message && (
                    <p className="mt-2 text-xs text-muted-foreground italic bg-secondary/50 rounded-lg px-3 py-2">
                      "{req.message}"
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5 border-green-500/30 text-green-500 hover:bg-green-500/10 hover:text-green-500"
                    disabled={processingId === req._id}
                    onClick={() => handle(req, 'accept')}
                  >
                    <Check className="h-3.5 w-3.5" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5 border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-500"
                    disabled={processingId === req._id}
                    onClick={() => handle(req, 'reject')}
                  >
                    <X className="h-3.5 w-3.5" />
                    Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pending count badge */}
      {requests.length > 0 && (
        <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {requests.length} pending request{requests.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
