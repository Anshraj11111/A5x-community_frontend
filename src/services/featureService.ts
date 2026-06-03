import api from './api';

export const featureService = {
  async getFeatures(params = {}) {
    const { data } = await api.get('/features', { params });
    return data;
  },

  async getFeature(id) {
    const { data } = await api.get(`/features/${id}`);
    return data.data.feature;
  },

  async createFeature(payload) {
    const { data } = await api.post('/features', payload);
    return data.data.feature;
  },

  async voteFeature(id) {
    const { data } = await api.post(`/features/${id}/vote`);
    return data.data;
  },

  async deleteFeature(id) {
    await api.delete(`/features/${id}`);
  },
};
