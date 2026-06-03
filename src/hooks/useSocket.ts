import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { SOCKET_URL } from '@/lib/constants';

export const useSocket = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);
  const { setUnreadCount, addNotification } = useNotificationStore();
  const socketRef = useRef<import('socket.io-client').Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    import('socket.io-client').then(({ io }) => {
      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('🔌 Socket connected');
      });

      socket.on('connect_error', (err) => {
        console.warn('Socket connection failed:', err.message);
      });

      socket.on('notification', (notification) => {
        addNotification(notification);
      });

      socket.on('notification_count', ({ unreadCount }: { unreadCount: number }) => {
        setUnreadCount(unreadCount);
      });

      socket.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, token, setUnreadCount, addNotification]);
};
