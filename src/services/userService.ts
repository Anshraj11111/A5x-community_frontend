import api from './api';

export const userService = {
  async getProfile(username: string) {
    const { data } = await api.get(`/users/${username}`);
    return data.data.user;
  },

  async updateProfile(payload: {
    displayName?: string;
    bio?: string;
    socialLinks?: { twitter?: string; github?: string; website?: string };
  }) {
    const { data } = await api.patch('/users/me', payload);
    return data.data.user;
  },

  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', file);
    const { data } = await api.patch('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // Backend now returns full Cloudinary URL directly
    return data.data.avatarUrl;
  },

  async uploadCover(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('cover', file);
    const { data } = await api.patch('/users/me/cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data.coverImageUrl;
  },

  async getUserPosts(username: string, params = {}) {
    const { data } = await api.get(`/users/${username}/posts`, { params });
    return data;
  },

  async getUserComments(username: string, params = {}) {
    const { data } = await api.get(`/users/${username}/comments`, { params });
    return data;
  },

  async getUserShowcase(username: string, params = {}) {
    const { data } = await api.get(`/users/${username}/showcase`, { params });
    return data;
  },

  async deleteAccount() {
    await api.delete('/users/me');
  },
};
