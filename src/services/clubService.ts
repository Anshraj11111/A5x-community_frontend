import api from './api';

export const clubService = {
  async getClubs(params = {}) {
    const { data } = await api.get('/clubs', { params });
    return data;
  },

  async getClub(slug) {
    const { data } = await api.get(`/clubs/${slug}`);
    return data.data.club;
  },

  async createClub(payload) {
    const { data } = await api.post('/clubs', payload);
    return data.data.club;
  },

  async updateClub(slug, payload) {
    const { data } = await api.patch(`/clubs/${slug}`, payload);
    return data.data.club;
  },

  async joinClub(slug) {
    await api.post(`/clubs/${slug}/join`);
  },

  async leaveClub(slug) {
    await api.post(`/clubs/${slug}/leave`);
  },

  async getClubMembers(slug, params = {}) {
    const { data } = await api.get(`/clubs/${slug}/members`, { params });
    return data;
  },

  async getClubPosts(slug, params = {}) {
    const { data } = await api.get(`/clubs/${slug}/posts`, { params });
    return data;
  },
};
