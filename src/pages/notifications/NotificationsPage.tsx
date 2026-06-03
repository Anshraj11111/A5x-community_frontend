import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { InlineLoader } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { notificationService } from '@/services/notificationService';
import { useNotificationStore } from '@/store/notificationStore';
import { useToast } from '@/store/uiStore';
import { QUERY_KEYS } from '@/lib/constants';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { markAllAsRead } = useNotificationStore();
  const { success } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.NOTIFICATIONS],
    queryFn: () => notificationService.getNotifications({ limit: 50 }),
  });

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    markAllAsRead();
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] });
    success('All notifications marked as read');
  };

  const handleRead = async (id: string) => {
    await notificationService.markAsRead(id);
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] });
  };

  const unreadCount = data?.data.filter((n) => !n.isRead).length ?? 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && <p className="text-sm text-muted-foreground mt-1">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="gap-1.5">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {isLoading ? <InlineLoader /> : data?.data.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet"
          description="You'll see activity from your posts, comments, and clubs here" />
      ) : (
        <div className="space-y-1">
          {data?.data.map((notification) => (
            <NotificationItem key={notification._id} notification={notification} onRead={handleRead} />
          ))}
        </div>
      )}
    </div>
  );
}
