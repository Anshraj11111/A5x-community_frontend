import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  _id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  bio?: string;
  role: 'user' | 'moderator' | 'admin' | 'founder' | 'co_founder';
  badges: unknown[];
  reputation: number;
  isVerified: boolean;
  isBanned: boolean;
  socialLinks?: { twitter?: string; github?: string; website?: string };
  preferences?: { emailNotifications: boolean; pushNotifications: boolean };
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (updates: Partial<User>) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true, isLoading: false });
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      clearAuth: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'a5x-auth',
      // Persist token, user, AND isAuthenticated so rehydration restores session
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // After rehydration: re-derive isAuthenticated from token + user presence
      onRehydrateStorage: () => (state) => {
        if (state) {
          const isValid = !!(state.token && state.user);
          state.isAuthenticated = isValid;
          // Keep token in sync with localStorage for the api interceptor
          if (isValid && state.token) {
            localStorage.setItem('token', state.token);
          }
        }
      },
    }
  )
);
