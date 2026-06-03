import { NavLink } from 'react-router-dom';
import {
  Home, MessageSquare, Lightbulb, Bug, Layers,
  Bell, User, Settings, Shield, Zap, Calendar, Map,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';

function FounderDeskIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 1L10 5.5H15L11 8.5L12.5 13L8 10L3.5 13L5 8.5L1 5.5H6L8 1Z"
        stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

const navItems = [
  { to: '/',              icon: Home,            label: 'Home',             exact: true,  special: false },
  { to: '/discussions',   icon: MessageSquare,   label: 'Discussions',      exact: false, special: false },
  { to: '/founders-desk', icon: FounderDeskIcon, label: "Founder's Desk",   exact: false, special: true  },
  { to: '/features',      icon: Lightbulb,       label: 'Feature Requests', exact: false, special: false },
  { to: '/bugs',          icon: Bug,             label: 'Bug Reports',      exact: false, special: false },
  { to: '/showcase',      icon: Layers,          label: 'Showcase',         exact: false, special: false },
  { to: '/events',        icon: Calendar,        label: 'Events',           exact: false, special: false },
  { to: '/journey',       icon: Map,             label: 'Product Journey',  exact: false, special: false },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user, isAuthenticated } = useAuthStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  return (
    <aside className={cn('flex flex-col h-full py-4', className)}>
      {/* Logo */}
      <div className="px-4 mb-6">
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-base tracking-tight">A5X Community</span>
        </NavLink>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-2 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label, exact, special }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                special && !isActive
                  ? 'text-[#00FF88]/80 hover:text-[#00FF88] hover:bg-[#00FF88]/10'
                  : isActive
                  ? special
                    ? 'bg-[#00FF88]/10 text-[#00FF88]'
                    : 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
            {/* Special badge for Founder's Desk */}
            {special && (
              <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/20 uppercase tracking-wide">
                New
              </span>
            )}
          </NavLink>
        ))}

        {isAuthenticated && (
          <>
            <div className="my-2 h-px bg-border" />
            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )
              }
            >
              <div className="relative">
                <Bell className="h-4 w-4 shrink-0" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              Notifications
              {unreadCount > 0 && (
                <span className="ml-auto text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          </>
        )}
      </nav>

      {/* Bottom section */}
      {isAuthenticated && user && (
        <div className="px-2 mt-4 space-y-0.5 border-t border-border pt-4">
          <NavLink
            to={`/u/${user.username}`}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )
            }
          >
            <User className="h-4 w-4 shrink-0" />
            Profile
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )
            }
          >
            <Settings className="h-4 w-4 shrink-0" />
            Settings
          </NavLink>
          {user.role === 'admin' && (
            <a
              href="/admin/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              <Shield className="h-4 w-4 shrink-0" />
              Admin Center
            </a>
          )}
        </div>
      )}

      {/* Founder's Desk promo at bottom */}
      {!isAuthenticated && (
        <div className="mx-2 mt-4 p-3 rounded-xl border border-[#00FF88]/20 bg-[#00FF88]/5">
          <p className="text-xs font-semibold text-[#00FF88] mb-1">Founder's Desk</p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Direct updates from the people building A5X.
          </p>
        </div>
      )}
    </aside>
  );
}
