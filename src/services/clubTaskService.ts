import api from './api';

export interface IClubTask {
  _id: string;
  title: string;
  description: string;
  points: number;
  season?: { _id: string; name: string; status: string } | null;
  dueDate?: string;
  isActive: boolean;
  createdAt: string;
  // enriched client-side
  completedByClubs?: { club: { _id: string; name: string; slug: string; icon?: string }; completedAt: string }[];
  completedCount?: number;
  myClubCompleted?: boolean;
}

export interface IClubTaskCompletion {
  _id?: string;
  task: IClubTask;
  club: { _id: string; name: string; slug: string; icon?: string; memberCount?: number };
  completedBy: { username: string; displayName: string; avatarUrl?: string };
  note?: string;
  completedAt: string;
}

export const clubTaskService = {
  async getAllTasks(params = {}) {
    const { data } = await api.get('/club-tasks', { params });
    return data;
  },

  async getTaskCompletions(taskId: string) {
    const { data } = await api.get(`/club-tasks/${taskId}/completions`);
    return data.data as { task: IClubTask; completions: IClubTaskCompletion[] };
  },

  async completeTask(taskId: string, clubSlug: string, note?: string) {
    await api.post(`/club-tasks/${taskId}/complete`, { clubSlug, note });
  },

  // Founder CRUD
  async createTask(payload: {
    title: string;
    description: string;
    points: number;
    seasonId?: string;
    dueDate?: string;
  }) {
    const { data } = await api.post('/club-tasks', payload);
    return data.data.task as IClubTask;
  },

  async updateTask(taskId: string, payload: Partial<{
    title: string;
    description: string;
    points: number;
    isActive: boolean;
    dueDate: string;
  }>) {
    const { data } = await api.patch(`/club-tasks/${taskId}`, payload);
    return data.data.task as IClubTask;
  },

  async deleteTask(taskId: string) {
    await api.delete(`/club-tasks/${taskId}`);
  },
};
