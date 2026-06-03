import api from './api';

export const authService = {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    return data.data; // { user, token }
  },

  async register(email, password, username, displayName) {
    const { data } = await api.post('/auth/register', { email, password, username, displayName });
    return data.data; // { user, token }
  },

  async getMe() {
    const { data } = await api.get('/auth/me');
    return data.data.user;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  async changePassword(currentPassword, newPassword) {
    const { data } = await api.patch('/auth/change-password', { currentPassword, newPassword });
    return data;
  },
};
