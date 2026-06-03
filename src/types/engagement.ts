export type ChallengeStatus = 'upcoming' | 'live' | 'completed';
export type ChallengeDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ChallengeCategory = 'build' | 'design' | 'bug_hunt' | 'beta_testing' | 'innovation' | 'content';
export type JourneyStage = 'idea' | 'research' | 'design' | 'prototype' | 'testing' | 'production' | 'released';
export type EventType = 'ama' | 'launch' | 'webinar' | 'meetup' | 'workshop' | 'hackathon' | 'community_call';

export interface IVoiceNote {
  _id: string;
  founder: { _id: string; name: string; role: string; avatar: string; badge: string };
  title: string;
  duration: number;
  audioUrl: string;
  transcript?: string;
  publishedAt: string;
  listenCount: number;
  waveform: number[];
}

export interface IChallengeEntry {
  _id: string;
  user: { _id: string; username: string; displayName: string; avatarUrl: string };
  title: string;
  description: string;
  link?: string;
  votes: number;
  isWinner: boolean;
  submittedAt: string;
}

export interface IChallenge {
  _id: string;
  title: string;
  description: string;
  rules: string[];
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  status: ChallengeStatus;
  reward: string;
  startDate: string;
  endDate: string;
  participantCount: number;
  entryCount: number;
  isJoined: boolean;
  entries: IChallengeEntry[];
  coverColor: string;
  icon: string;
}

export interface IHallOfFameUser {
  rank: number;
  user: { _id: string; username: string; displayName: string; avatarUrl: string; isVerified: boolean };
  points: number;
  acceptedFeatures: number;
  bugsFound: number;
  challengesWon: number;
  postsCreated: number;
  commentsMade: number;
  badge: string;
  category: string;
}

export interface IJourneyMilestone {
  _id: string;
  stage: JourneyStage;
  title: string;
  description: string;
  date: string;
  founderNote?: string;
  images: string[];
  isCompleted: boolean;
}

export interface IProductJourney {
  _id: string;
  productName: string;
  productSlug: string;
  coverImage: string;
  currentStage: JourneyStage;
  description: string;
  milestones: IJourneyMilestone[];
  followers: number;
  isFollowing: boolean;
  startedAt: string;
  updatedAt: string;
}

export interface ICommunityEvent {
  _id: string;
  title: string;
  description: string;
  type: EventType;
  host: { _id: string; name: string; avatar: string; role: string };
  startDate: string;
  endDate: string;
  isOnline: boolean;
  location?: string;
  meetLink?: string;
  attendeeCount: number;
  maxAttendees?: number;
  isRegistered: boolean;
  isPast: boolean;
  recordingUrl?: string;
  coverColor: string;
  tags: string[];
}

export interface ICommunityMilestone {
  _id: string;
  label: string;
  value: number;
  target: number;
  unit: string;
  icon: string;
  color: string;
  achievedAt?: string;
}
