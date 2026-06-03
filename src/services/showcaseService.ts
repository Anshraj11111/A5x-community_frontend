import api from './api';

export const showcaseService = {
  async getShowcasePosts(params = {}) {
    const { data } = await api.get('/showcase', { params });
    return data;
  },

  async getShowcasePost(id) {
    const { data } = await api.get(`/showcase/${id}`);
    return data.data.post;
  },

  async createShowcasePost(payload) {
    const { data } = await api.post('/showcase', payload);
    return data.data.post;
  },

  async updateShowcasePost(id, payload) {
    const { data } = await api.patch(`/showcase/${id}`, payload);
    return data.data.post;
  },

  async deleteShowcasePost(id) {
    await api.delete(`/showcase/${id}`);
  },

  async upvoteShowcase(id) {
    const { data } = await api.post(`/showcase/${id}/upvote`);
    return data.data;
  },
};
