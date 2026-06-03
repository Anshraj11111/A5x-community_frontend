import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, Flag, Lightbulb, Bug,
  Calendar, Zap, Bell, BarChart3, ScrollText,
  Settings, LogOut, Menu, X, Shield, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminStore } from '@/store/adminStore';
import { useToast } from '@/store/uiStore';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { to: '/admin/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/admin/analytics',    icon: BarChart3,       label: 'Analytics' },
    ],
  },
  {
    label: 'Community',
    items: [
      { to: '/admin/users',        icon: Users,           label: 'Users' },
      { to: '/admin/content',      icon: FileText,        label: 'Content' },
      { to: '/admin/reports',      icon: Flag,            label: 'Reports' },
      { to: '/admin/features',     icon: Lightbulb,       label: 'Features' },
      { to: '/admin/bugs',         icon: Bug,             label: 'Bugs' },
    ],
  },
  {
    label: 'Platform',
    items: [
      { to: '/admin/events',       icon: Calendar,        label: 'Events' },
      { to: '/admin/founders',     icon: Zap,             label: "Founder's Desk" },
      { to: '/admin/notifications',icon: Bell,            label: 'Notifications' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/audit',        icon: ScrollText,      label: 'Audit Logs' },
      { to: '/admin/settings',     icon: Settings,        label: 'Settings' },
    ],
  },
];

export function AdminShell() {
  const { adminUser, sidebarCollapsed, toggleSidebar, clearAdminAuth } = useAdminStore();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    clearAdminAuth();
    success('Logged out of admin panel');
    navigate('/admin/login');
  };

  const ROLE_COLORS = {
    founder:    'text-[#00FF88] bg-[#00FF88]/10 border-[#00FF88]/20',
    co_founder: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
    admin:      'text-blue-400 bg-blue-400/10 border-blue-400/20',
    moderator:  'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  };

  return (
    <div className="min-h-screen bg-[#080808] flex">
      {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
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
          {NAV_SECTIONS.map(({ label, items }) => (
            <div key={label}>
              {!sidebarCollapsed && (
                <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest px-2 mb-1">{label}</p>
              )}
              <div className="space-y-0.5">
                {items.map(({ to, icon: Icon, label: itemLabel }) => (
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
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-[#1a1a1a] p-3 shrink-0">
          {adminUser && (
            <div className={cn('flex items-center gap-2.5', sidebarCollapsed && 'justify-center')}>
              <img src={adminUser.avatar} alt={adminUser.name}
                className="h-7 w-7 rounded-full shrink-0 ring-1 ring-[#00FF88]/30" />
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{adminUser.name}</p>
                  <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full border capitalize', ROLE_COLORS[adminUser.role])}>
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

      {/* ── MAIN ─────────────────────────────────────────────────────── */}
      <div className={cn('flex-1 flex flex-col transition-all duration-300', sidebarCollapsed ? 'ml-16' : 'ml-60')}>
        {/* Topbar */}
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

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
