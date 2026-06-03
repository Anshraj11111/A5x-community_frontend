import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';

export const useAuth = () => {
  const { token, user, isAuthenticated, setLoading, clearAuth } = useAuthStore();

  useEffect(() => {
    // If we have a token, verify it's still valid by fetching current user
    if (token && !user) {
      authService.getMe()
        .then((me) => {
          useAuthStore.getState().setAuth(me, token);
        })
        .catch(() => {
          clearAuth();
        });
    }
  }, [token, user, clearAuth]);

  return { token, user, isAuthenticated };
};
