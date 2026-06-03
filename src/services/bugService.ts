import api from './api';

export const bugService = {
  async getBugs(params = {}) {
    const { data } = await api.get('/bugs', { params });
    return data;
  },

  async getBug(id) {
    const { data } = await api.get(`/bugs/${id}`);
    return data.data.bug;
  },

  async createBug(payload) {
    const { data } = await api.post('/bugs', payload);
    return data.data.bug;
  },

  async deleteBug(id) {
    await api.delete(`/bugs/${id}`);
  },
};
