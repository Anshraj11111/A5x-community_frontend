import api from './api';

export const notificationService = {
  async getNotifications(params = {}) {
    const { data } = await api.get('/notifications', { params });
    return data;
  },

  async getUnreadCount() {
    const { data } = await api.get('/notifications/unread-count');
    return data.data.unreadCount;
  },

  async markAsRead(id) {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    await api.patch('/notifications/read-all');
  },

  async deleteNotification(id) {
    await api.delete(`/notifications/${id}`);
  },
};
