import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from './router';
import { useAuthStore } from './store/authStore';
import api from './services/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
      retry: false,
      refetchOnWindowFocus: false,
      throwOnError: false,
    },
    mutations: {
      retry: 0,
      throwOnError: false,
    },
  },
});

/**
 * SessionGuard — runs once on mount.
 * If a token is in localStorage, verifies it with /auth/me and refreshes
 * the user object. If the token is expired/invalid, clears the session.
 */
function SessionGuard() {
  const { token, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    if (!token) return;

    api.get('/auth/me')
      .then(({ data }) => {
        // Refresh user object with latest data from server
        setAuth(data.data.user, token);
      })
      .catch(() => {
        // Token is expired or invalid — log the user out silently
        clearAuth();
      });
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionGuard />
      <AppRouter />
    </QueryClientProvider>
  );
}
