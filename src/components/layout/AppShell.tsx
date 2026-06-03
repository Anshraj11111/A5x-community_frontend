import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Toaster } from '@/components/ui/toast';
import { useUIStore } from '@/store/uiStore';
import { useSocket } from '@/hooks/useSocket';
import { cn } from '@/lib/utils';

export function AppShell() {
  useSocket(); // Initialize socket connection

  const { isSidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-60 lg:flex-col border-r border-border bg-background">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-background transition-transform duration-300 lg:hidden',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar />
      </aside>

      {/* Main content */}
      <div className="lg:pl-60">
        <Topbar />
        <main className="min-h-[calc(100vh-3.5rem)]">
          <Outlet />
        </main>
      </div>

      <Toaster />
    </div>
  );
}
