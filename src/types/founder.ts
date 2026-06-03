export type FounderBadgeType = 'founder' | 'co_founder' | 'core_team' | 'a5x_team';
export type RoadmapStatus = 'planned' | 'researching' | 'designing' | 'developing' | 'testing' | 'released';

export interface IFounder {
  _id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  badge: FounderBadgeType;
  social: { twitter?: string; linkedin?: string; github?: string };
  followers: number;
  postsCount: number;
  answersCount: number;
}

export interface IFounderPost {
  _id: string;
  founder: IFounder;
  type: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  likeCount: number;
  commentCount: number;
  hasLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IRoadmapItem {
  _id: string;
  founder: IFounder;
  title: string;
  description: string;
  status: RoadmapStatus;
  product: string;
  quarter: string;
  followers: number;
  isFollowing: boolean;
  updatedAt: string;
}

export interface IAMAQuestion {
  _id: string;
  author: { _id: string; username: string; displayName: string; avatarUrl: string };
  question: string;
  voteCount: number;
  hasVoted: boolean;
  isAnswered: boolean;
  answer?: string;
  answeredBy?: IFounder;
  answeredAt?: string;
  createdAt: string;
}

export interface IFounderPoll {
  _id: string;
  founder: IFounder;
  question: string;
  options: { _id: string; text: string; voteCount: number; percentage: number }[];
  totalVotes: number;
  hasVoted: boolean;
  userVote?: string;
  endsAt: string;
  createdAt: string;
}

export interface IMonthlyLetter {
  _id: string;
  founder: IFounder;
  month: string;
  year: number;
  subject: string;
  content: string;
  achievements: string[];
  learnings: string[];
  futurePlans: string[];
  communityHighlight: string;
  createdAt: string;
}
