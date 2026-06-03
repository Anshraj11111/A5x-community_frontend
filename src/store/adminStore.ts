import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AdminRole = 'founder' | 'co_founder' | 'admin' | 'moderator';

export interface IAdminUser {
  _id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar: string;
  lastLogin: string;
  permissions: string[];
}

interface AdminState {
  adminUser: IAdminUser | null;
  adminToken: string | null;
  isAdminAuthenticated: boolean;
  sidebarCollapsed: boolean;
  setAdminAuth: (user: IAdminUser, token: string) => void;
  clearAdminAuth: () => void;
  toggleSidebar: () => void;
}

export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  founder:    ['*'],
  co_founder: ['*'],
  admin:      ['users', 'content', 'reports', 'features', 'bugs', 'clubs', 'events', 'challenges', 'notifications', 'analytics', 'audit'],
  moderator:  ['content', 'reports'],
};

export const hasPermission = (role: AdminRole, permission: string): boolean => {
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes('*') || perms.includes(permission);
};

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      adminUser: null,
      adminToken: null,
      isAdminAuthenticated: false,
      sidebarCollapsed: false,
      setAdminAuth: (adminUser, adminToken) =>
        set({ adminUser, adminToken, isAdminAuthenticated: true }),
      clearAdminAuth: () =>
        set({ adminUser: null, adminToken: null, isAdminAuthenticated: false }),
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    {
      name: 'a5x-admin',
      // Persist all auth fields so isAdminAuthenticated survives page reload
      partialize: (s) => ({
        adminToken: s.adminToken,
        adminUser: s.adminUser,
        isAdminAuthenticated: s.isAdminAuthenticated,
      }),
    }
  )
);
