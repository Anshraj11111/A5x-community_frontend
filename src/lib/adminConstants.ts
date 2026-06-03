import type { IAdminUser } from '@/store/adminStore';

export const ADMIN_ACCESS_CODE = 'H-5';

export const defaultAdminUsers: IAdminUser[] = [
  {
    _id: 'admin_001',
    name: 'Aryan Kapoor',
    email: 'aryan@a5x.community',
    role: 'founder',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aryan&backgroundColor=00FF88',
    lastLogin: new Date().toISOString(),
    permissions: ['*'],
  },
  {
    _id: 'admin_002',
    name: 'Admin User',
    email: 'admin@a5x.community',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    lastLogin: new Date().toISOString(),
    permissions: ['users', 'content', 'reports', 'features', 'bugs'],
  },
];
