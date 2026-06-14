import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { championshipKeys } from '@/services/championshipService';
import { SOCKET_URL } from '@/lib/constants';

/**
 * Subscribes to real-time championship events for the given season.
 * Emits join_season on mount and leave_season on cleanup.
 * Invalidates leaderboard / season queries on relevant events.
 */
export function useChampionshipSocket(seasonId: string | undefined) {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const socketRef = useRef<import('socket.io-client').Socket | null>(null);

  useEffect(() => {
    // Only connect when authenticated and a seasonId is provided
    if (!isAuthenticated || !token || !seasonId) return;

    import('socket.io-client').then(({ io }) => {
      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('join_season', { seasonId });
      });

      // Leaderboard changed — invalidate only if it's for this season
      socket.on('leaderboard_update', (data: { seasonId: string }) => {
        if (data.seasonId === seasonId) {
          queryClient.invalidateQueries({
            queryKey: championshipKeys.leaderboard(seasonId),
          });
        }
      });

      // Season ended — invalidate season record and leaderboard
      socket.on('season_ended', (data: { seasonId: string }) => {
        queryClient.invalidateQueries({
          queryKey: championshipKeys.season(data.seasonId),
        });
        queryClient.invalidateQueries({
          queryKey: championshipKeys.leaderboard(data.seasonId),
        });
        queryClient.invalidateQueries({
          queryKey: championshipKeys.currentSeason,
        });
      });

      // Season started — refresh current season
      socket.on('season_started', () => {
        queryClient.invalidateQueries({
          queryKey: championshipKeys.currentSeason,
        });
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_season', { seasonId });
        socketRef.current.off('leaderboard_update');
        socketRef.current.off('season_ended');
        socketRef.current.off('season_started');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, token, seasonId, queryClient]);
}
