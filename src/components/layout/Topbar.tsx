import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, LogOut, User, Settings, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/common/UserAvatar';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useUIStore, useToast } from '@/store/uiStore';
import { authService } from '@/services/authService';
import { cn } from '@/lib/utils';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export function Topbar() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const { toggleSidebar } = useUIStore();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      clearAuth();
      success('Logged out successfully');
      navigate('/login');
    } catch {
      error('Failed to log out');
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center border-b border-border bg-background/95 backdrop-blur px-4 gap-3">
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile logo */}
      <Link to="/" className="flex items-center gap-2 lg:hidden">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <Zap className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <span className="font-bold text-sm">A5X</span>
      </Link>

      <div className="flex-1" />

      {isAuthenticated && user ? (
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link to="/notifications" aria-label="Notifications">
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-primary" />
              )}
            </Link>
          </Button>

          {/* User menu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="focus:outline-none focus:ring-2 focus:ring-ring rounded-full">
                <UserAvatar user={user} size="sm" showVerified />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[180px] rounded-xl border border-border bg-card p-1 shadow-xl animate-fade-in"
                align="end"
                sideOffset={8}
              >
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-sm font-medium">{user.displayName}</p>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                </div>
                <DropdownMenu.Item asChild>
                  <Link
                    to={`/u/${user.username}`}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer',
                      'hover:bg-secondary transition-colors outline-none'
                    )}
                  >
                    <User className="h-4 w-4" /> Profile
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link
                    to="/settings"
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer',
                      'hover:bg-secondary transition-colors outline-none'
                    )}
                  >
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-border" />
                <DropdownMenu.Item
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer',
                    'text-destructive hover:bg-destructive/10 transition-colors outline-none'
                  )}
                  onSelect={handleLogout}
                >
                  <LogOut className="h-4 w-4" /> Log out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/register">Join</Link>
          </Button>
        </div>
      )}
    </header>
  );
}
