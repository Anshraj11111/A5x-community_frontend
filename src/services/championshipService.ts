import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IScoringRules {
  post: number;
  comment: number;
  upvoteReceived: number;
  showcasePost: number;
  featureRequest: number;
  bugReport: number;
  pollCreated: number;
}

export interface IRewards {
  first: string;
  second: string;
  third: string;
}

export interface ITopClub {
  rank: number;
  club: string;
  score: number;
}

export interface IChampionshipSeason {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  status: 'upcoming' | 'active' | 'ended';
  startDate: string;
  endDate: string;
  finalizedAt?: string;
  scoringRules: IScoringRules;
  topClubs: ITopClub[];
  rewards: IRewards;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IClubScore {
  _id: string;
  season: string;
  club: {
    _id: string;
    name: string;
    slug: string;
    icon?: string;
    memberCount: number;
  };
  totalScore: number;
  breakdown: Partial<IScoringRules>;
  rank: number | null;
  lastScoredAt: string;
}

export interface ICreateSeasonPayload {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  scoringRules?: Partial<IScoringRules>;
  rewards?: Partial<IRewards>;
}

export type IUpdateSeasonPayload = Partial<ICreateSeasonPayload>;

// ─── Query Key Factory ────────────────────────────────────────────────────────

export const championshipKeys = {
  all: ['championship'] as const,
  currentSeason: ['championship', 'current'] as const,
  seasons: ['championship', 'seasons'] as const,
  season: (id: string) => ['championship', 'seasons', id] as const,
  leaderboard: (seasonId: string) => ['championship', 'leaderboard', seasonId] as const,
  clubScore: (seasonId: string, clubSlug: string) =>
    ['championship', 'clubScore', seasonId, clubSlug] as const,
  adminSeasons: ['championship', 'admin', 'seasons'] as const,
};

// ─── Public API Methods ───────────────────────────────────────────────────────

export const championshipService = {
  async getCurrentSeason(): Promise<IChampionshipSeason | null> {
    const { data } = await api.get('/championship/season/current');
    return data.data?.season ?? null;
  },

  async getAllSeasons(): Promise<IChampionshipSeason[]> {
    const { data } = await api.get('/championship/seasons');
    return data.data?.seasons ?? [];
  },

  async getSeasonById(seasonId: string): Promise<IChampionshipSeason> {
    const { data } = await api.get(`/championship/seasons/${seasonId}`);
    return data.data.season;
  },

  async getLeaderboard(
    seasonId: string,
    page = 1,
    limit = 20
  ): Promise<{ scores: IClubScore[]; pagination: unknown }> {
    const { data } = await api.get(`/championship/season/${seasonId}/leaderboard`, {
      params: { page, limit },
    });
    return { scores: data.data, pagination: data.pagination };
  },

  async getClubScore(seasonId: string, clubSlug: string): Promise<IClubScore> {
    const { data } = await api.get(`/championship/season/${seasonId}/clubs/${clubSlug}`);
    return data.data.score ?? data.data;
  },

  // ─── Admin Methods (require JWT) ─────────────────────────────────────────

  async adminListSeasons(): Promise<IChampionshipSeason[]> {
    const { data } = await api.get('/admin/championship/seasons');
    return data.data?.seasons ?? [];
  },

  async adminCreateSeason(payload: ICreateSeasonPayload): Promise<IChampionshipSeason> {
    const { data } = await api.post('/admin/championship/seasons', payload);
    return data.data.season;
  },

  async adminUpdateSeason(
    id: string,
    payload: IUpdateSeasonPayload
  ): Promise<IChampionshipSeason> {
    const { data } = await api.patch(`/admin/championship/seasons/${id}`, payload);
    return data.data.season;
  },

  async adminDeleteSeason(id: string): Promise<void> {
    await api.delete(`/admin/championship/seasons/${id}`);
  },

  async adminActivateSeason(id: string): Promise<IChampionshipSeason> {
    const { data } = await api.post(`/admin/championship/seasons/${id}/activate`);
    return data.data.season;
  },

  async adminEndSeason(id: string): Promise<IChampionshipSeason> {
    const { data } = await api.post(`/admin/championship/seasons/${id}/end`);
    return data.data.season;
  },
};
