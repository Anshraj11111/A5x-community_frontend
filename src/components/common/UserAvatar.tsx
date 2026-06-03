import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn, getInitials } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

interface UserAvatarProps {
  user: {
    username: string;
    displayName: string;
    avatarUrl?: string;
    isVerified?: boolean;
  };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showVerified?: boolean;
  linkToProfile?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-11 w-11 text-base',
  xl: 'h-16 w-16 text-lg',
};

export function UserAvatar({
  user,
  size = 'md',
  showVerified = false,
  linkToProfile = false,
  className,
}: UserAvatarProps) {
  const avatar = (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={user.avatarUrl} alt={user.displayName} />
        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
      </Avatar>
      {showVerified && user.isVerified && (
        <CheckCircle className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 text-primary fill-background" />
      )}
    </div>
  );

  if (linkToProfile) {
    return <Link to={`/u/${user.username}`}>{avatar}</Link>;
  }

  return avatar;
}
