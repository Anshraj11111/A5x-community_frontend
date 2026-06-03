import { Link } from 'react-router-dom';
import { Bell, ArrowUp, MessageSquare, Award, Users, Zap } from 'lucide-react';
import { UserAvatar } from '@/components/common/UserAvatar';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { INotification } from '@/types';

interface NotificationItemProps {
  notification: INotification;
  onRead?: (id: string) => void;
}

const typeIcons: Record<string, React.ElementType> = {
  post_upvote: ArrowUp,
  post_comment: MessageSquare,
  comment_reply: MessageSquare,
  comment_upvote: ArrowUp,
  feature_vote: ArrowUp,
  feature_status_change: Zap,
  bug_status_change: Zap,
  badge_awarded: Award,
  club_join: Users,
  club_invite: Users,
  product_update: Zap,
  system: Bell,
};

const getEntityLink = (notification: INotification): string => {
  switch (notification.entityType) {
    case 'post': return `/discussions/${notification.entityId}`;
    case 'founder_post': return `/founders-desk`;
    case 'feature': return `/features/${notification.entityId}`;
    case 'bug': return `/bugs/${notification.entityId}`;
    case 'showcase': return `/showcase/${notification.entityId}`;
    case 'club': return `/clubs/${notification.entityId}`;
    default: return '/notifications';
  }
};

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const Icon = typeIcons[notification.type] || Bell;

  return (
    <Link
      to={getEntityLink(notification)}
      onClick={() => onRead?.(notification._id)}
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl transition-colors hover:bg-secondary',
        !notification.isRead && 'bg-primary/5 border border-primary/10'
      )}
    >
      {/* Sender avatar or icon */}
      {notification.sender ? (
        <UserAvatar user={notification.sender} size="sm" className="shrink-0 mt-0.5" />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary mt-0.5">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(notification.createdAt)}</p>
      </div>

      {!notification.isRead && (
        <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
      )}
    </Link>
  );
}
