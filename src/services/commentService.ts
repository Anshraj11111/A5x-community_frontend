import api from './api';

export const commentService = {
  async createComment(payload) {
    const { data } = await api.post('/comments', payload);
    return data.data.comment;
  },

  async updateComment(id, content) {
    const { data } = await api.patch(`/comments/${id}`, { content });
    return data.data.comment;
  },

  async deleteComment(id) {
    await api.delete(`/comments/${id}`);
  },

  async upvoteComment(id) {
    const { data } = await api.post(`/comments/${id}/upvote`);
    return data.data;
  },
};
