import api from './api';

export const clubService = {
  async getClubs(params = {}) {
    const { data } = await api.get('/clubs', { params });
    return data;
  },

  async getClub(slug: string) {
    const { data } = await api.get(`/clubs/${slug}`);
    return data.data.club;
  },

  async createClub(payload: object) {
    const { data } = await api.post('/clubs', payload);
    return data.data.club;
  },

  async updateClub(slug: string, payload: object) {
    const { data } = await api.patch(`/clubs/${slug}`, payload);
    return data.data.club;
  },

  /** Send a join request (replaces direct join for regular users) */
  async requestJoin(slug: string, message?: string) {
    await api.post(`/clubs/${slug}/request-join`, { message });
  },

  async leaveClub(slug: string) {
    await api.post(`/clubs/${slug}/leave`);
  },

  async getClubMembers(slug: string, params = {}) {
    const { data } = await api.get(`/clubs/${slug}/members`, { params });
    return data;
  },

  async getClubPosts(slug: string, params = {}) {
    const { data } = await api.get(`/clubs/${slug}/posts`, { params });
    return data;
  },

  /** Founder promotes/demotes a club member */
  async updateMemberRole(slug: string, userId: string, role: 'moderator' | 'member') {
    const { data } = await api.patch(`/clubs/${slug}/members/${userId}/role`, { role });
    return data;
  },

  /** Founder / owner: get pending join requests for a specific club */
  async getJoinRequests(slug: string, status = 'pending') {
    const { data } = await api.get(`/clubs/${slug}/join-requests`, { params: { status } });
    return data;
  },

  /** Founder / owner: accept or reject a join request */
  async handleJoinRequest(slug: string, requestId: string, action: 'accept' | 'reject') {
    await api.patch(`/clubs/${slug}/join-requests/${requestId}`, { action });
  },

  /** Founder / admin: all pending requests across all clubs */
  async getAllPendingRequests(params = {}) {
    const { data } = await api.get('/clubs/join-requests/all', { params });
    return data;
  },

  /** Check if current user is a club moderator — used to show admin panel link */
  async checkClubModeratorStatus(): Promise<{ isClubModerator: boolean; club: { _id: string; name: string; slug: string } | null }> {
    const { data } = await api.get('/auth/club-moderator-check');
    return data.data;
  },
};
