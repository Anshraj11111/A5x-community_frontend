import api from './api';

export const userService = {
  async getProfile(username) {
    const { data } = await api.get(`/users/${username}`);
    return data.data.user;
  },

  async updateProfile(payload) {
    const { data } = await api.patch('/users/me', payload);
    return data.data.user;
  },

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    const { data } = await api.patch('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // Prepend backend URL if it's a relative path
    const url = data.data.avatarUrl;
    const fullUrl = url?.startsWith('/') ? `${import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000'}${url}` : url;
    return fullUrl;
  },

  async uploadCover(file) {
    const formData = new FormData();
    formData.append('cover', file);
    const { data } = await api.patch('/users/me/cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const url = data.data.coverImageUrl;
    const fullUrl = url?.startsWith('/') ? `${import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000'}${url}` : url;
    return fullUrl;
  },

  async getUserPosts(username, params = {}) {
    const { data } = await api.get(`/users/${username}/posts`, { params });
    return data;
  },

  async getUserComments(username, params = {}) {
    const { data } = await api.get(`/users/${username}/comments`, { params });
    return data;
  },

  async getUserShowcase(username, params = {}) {
    const { data } = await api.get(`/users/${username}/showcase`, { params });
    return data;
  },

  async deleteAccount() {
    await api.delete('/users/me');
  },
};
