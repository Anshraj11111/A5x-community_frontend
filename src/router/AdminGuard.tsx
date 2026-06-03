import { Navigate } from 'react-router-dom';
import { useAdminStore } from '@/store/adminStore';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isAdminAuthenticated, adminToken } = useAdminStore();

  // Ensure the token is in localStorage so api.ts interceptor attaches it
  if (adminToken) {
    localStorage.setItem('token', adminToken);
  }

  if (!isAdminAuthenticated || !adminToken) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}
