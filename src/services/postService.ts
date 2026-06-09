import api from './api';

export const postService = {
  async getPosts(params = {}) {
    const { data } = await api.get('/posts', { params });
    return data;
  },

  async getPost(id) {
    const { data } = await api.get(`/posts/${id}`);
    return data.data.post;
  },

  async createPost(payload) {
    const { data } = await api.post('/posts', payload);
    return data.data.post;
  },

  async updatePost(id, payload) {
    const { data } = await api.patch(`/posts/${id}`, payload);
    return data.data.post;
  },

  async deletePost(id) {
    await api.delete(`/posts/${id}`);
  },

  async upvotePost(id) {
    const { data } = await api.post(`/posts/${id}/upvote`);
    return data.data;
  },

  async downvotePost(id) {
    const { data } = await api.post(`/posts/${id}/downvote`);
    return data.data;
  },

  async repostPost(id) {
    const { data } = await api.post(`/posts/${id}/repost`);
    return data.data;
  },

  async getPostComments(id, params = {}) {
    const { data } = await api.get(`/posts/${id}/comments`, { params });
    return data;
  },
};
