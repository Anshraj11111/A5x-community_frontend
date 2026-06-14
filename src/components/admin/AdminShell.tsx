import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, Flag, Lightbulb, Bug,
  Calendar, Zap, Bell, BarChart3, ScrollText,
  Settings, LogOut, Menu, X, Shield, ChevronRight, UserCheck, Users2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminStore, type AdminRole } from '@/store/adminStore';
import { useToast } from '@/store/uiStore';

// ── Nav item with optional role restriction ───────────────────────────────────
interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  /** If set, only these roles can see the item */
  roles?: AdminRole[];
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { to: '/admin/dashboard',    icon: LayoutDashboard, label: 'Dashboard',      roles: ['founder', 'co_founder', 'admin'] },
      { to: '/admin/analytics',    icon: BarChart3,       label: 'Analytics',      roles: ['founder', 'co_founder', 'admin'] },
    ],
  },
  {
    label: 'Community',
    items: [
      { to: '/admin/users',         icon: Users,       label: 'Users',          roles: ['founder', 'co_founder', 'admin'] },
      { to: '/admin/content',       icon: FileText,    label: 'Content',        roles: ['founder', 'co_founder', 'admin'] },
      { to: '/admin/reports',       icon: Flag,        label: 'Reports',        roles: ['founder', 'co_founder', 'admin'] },
      { to: '/admin/features',      icon: Lightbulb,   label: 'Features',       roles: ['founder', 'co_founder', 'admin'] },
      { to: '/admin/bugs',          icon: Bug,         label: 'Bugs',           roles: ['founder', 'co_founder', 'admin'] },
      { to: '/admin/clubs',         icon: Users2,      label: 'Clubs',          roles: ['founder', 'co_founder', 'admin'] },
      // Club Requests — visible to founder/admin AND club moderators
      { to: '/admin/club-requests', icon: UserCheck,   label: 'Club Requests'  },
      { to: '/admin/tasks',         icon: Zap,         label: 'Club Tasks',     roles: ['founder', 'co_founder', 'admin'] },
    ],
  },
  {
    label: 'Platform',
    items: [
      { to: '/admin/events',        icon: Calendar,    label: 'Events',         roles: ['founder', 'co_founder', 'admin'] },
      { to: '/admin/founders',      icon: Zap,         label: "Founder's Desk", roles: ['founder', 'co_founder', 'admin'] },
      { to: '/admin/notifications', icon: Bell,        label: 'Notifications',  roles: ['founder', 'co_founder', 'admin'] },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/audit',         icon: ScrollText,  label: 'Audit Logs',     roles: ['founder', 'co_founder', 'admin'] },
      { to: '/admin/settings',      icon: Settings,    label: 'Settings',       roles: ['founder', 'co_founder', 'admin'] },
    ],
  },
];

const ROLE_COLORS: Record<AdminRole, string> = {
  founder:    'text-[#00FF88] bg-[#00FF88]/10 border-[#00FF88]/20',
  co_founder: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
  admin:      'text-blue-400 bg-blue-400/10 border-blue-400/20',
  moderator:  'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
};

export function AdminShell() {
  const { adminUser, sidebarCollapsed, toggleSidebar, clearAdminAuth } = useAdminStore();
  const { success } = useToast();
  const navigate = useNavigate();

  const role = adminUser?.role ?? 'moderator';

  const handleLogout = () => {
    localStorage.removeItem('token');
    clearAdminAuth();
    success('Logged out');
    navigate('/admin/login');
  };

  /** Returns true if the current role can see this nav item */
  const canSee = (item: NavItem): boolean => {
    if (!item.roles) return true; // no restriction = everyone
    return item.roles.includes(role as AdminRole);
  };

  return (
    <div className="min-h-screen bg-[#080808] flex">
      {/* ── SIDEBAR ────────────────────────────────────────────────── */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[#1a1a1a] bg-[#0a0a0a] transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}>
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-[#1a1a1a] px-4 gap-3 shrink-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#00FF88]">
            <Shield className="h-3.5 w-3.5 text-black" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate">Admin Center</p>
              <p className="text-[10px] text-muted-foreground truncate">A5X Community</p>
            </div>
          )}
          <button onClick={toggleSidebar} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {NAV_SECTIONS.map(({ label, items }) => {
            const visible = items.filter(canSee);
            if (visible.length === 0) return null;
            return (
              <div key={label}>
                {!sidebarCollapsed && (
                  <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest px-2 mb-1">
                    {label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {visible.map(({ to, icon: Icon, label: itemLabel }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) => cn(
                        'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150',
                        isActive
                          ? 'bg-[#00FF88]/10 text-[#00FF88]'
                          : 'text-[#666] hover:text-foreground hover:bg-[#111]'
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!sidebarCollapsed && <span className="truncate">{itemLabel}</span>}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-[#1a1a1a] p-3 shrink-0">
          {adminUser && (
            <div className={cn('flex items-center gap-2.5', sidebarCollapsed && 'justify-center')}>
              <img
                src={adminUser.avatar}
                alt={adminUser.name}
                className="h-7 w-7 rounded-full shrink-0 ring-1 ring-[#00FF88]/30"
              />
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{adminUser.name}</p>
                  <span className={cn(
                    'text-[10px] font-medium px-1.5 py-0.5 rounded-full border capitalize',
                    ROLE_COLORS[adminUser.role] ?? ROLE_COLORS.moderator
                  )}>
                    {adminUser.role.replace('_', ' ')}
                  </span>
                </div>
              )}
              {!sidebarCollapsed && (
                <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN ───────────────────────────────────────────────────── */}
      <div className={cn('flex-1 flex flex-col transition-all duration-300', sidebarCollapsed ? 'ml-16' : 'ml-60')}>
        <header className="sticky top-0 z-30 flex h-14 items-center border-b border-[#1a1a1a] bg-[#0a0a0a]/95 backdrop-blur px-6 gap-4">
          <button onClick={toggleSidebar} className="text-muted-foreground hover:text-foreground transition-colors lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-[#00FF88] bg-[#00FF88]/10 border border-[#00FF88]/20 px-2.5 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00FF88] animate-pulse" />
              System Online
            </div>
            {adminUser && (
              <img src={adminUser.avatar} alt={adminUser.name} className="h-7 w-7 rounded-full ring-1 ring-[#00FF88]/30" />
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
