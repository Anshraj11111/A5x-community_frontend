export interface IUser {
  _id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  bio?: string;
  role: 'user' | 'moderator' | 'admin';
  badges: IBadge[];
  reputation: number;
  isVerified: boolean;
  isBanned: boolean;
  banReason?: string;
  socialLinks?: { twitter?: string; github?: string; website?: string };
  preferences?: { emailNotifications: boolean; pushNotifications: boolean };
  createdAt: string;
  updatedAt: string;
}

export interface IBadge {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  color: string;
}

export interface IPost {
  _id: string;
  author: Pick<IUser, '_id' | 'username' | 'displayName' | 'avatarUrl' | 'role' | 'isVerified'>;
  title: string;
  slug: string;
  content: string;
  type: 'discussion' | 'question' | 'announcement';
  tags: string[];
  images: string[];
  club?: string;
  upvotes: string[];
  downvotes: string[];
  voteScore: number;
  commentCount: number;
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IComment {
  _id: string;
  post: string;
  author: Pick<IUser, '_id' | 'username' | 'displayName' | 'avatarUrl' | 'role' | 'isVerified'>;
  parent?: string | null;
  content: string;
  upvotes: string[];
  voteScore: number;
  isDeleted: boolean;
  depth: number;
  replies?: IComment[];
  createdAt: string;
  updatedAt: string;
}

export interface IFeatureRequest {
  _id: string;
  author: Pick<IUser, '_id' | 'username' | 'displayName' | 'avatarUrl'>;
  title: string;
  description: string;
  status: 'open' | 'under_review' | 'planned' | 'in_development' | 'released' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  voteCount: number;
  hasVoted?: boolean;
  tags: string[];
  adminNote?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BugSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface IBugReport {
  _id: string;
  reporter: Pick<IUser, '_id' | 'username' | 'displayName' | 'avatarUrl'>;
  title: string;
  description: string;
  steps?: string;
  severity: BugSeverity;
  status: 'reported' | 'confirmed' | 'investigating' | 'fixed' | 'released';
  attachments: string[];
  adminNote?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IProductClub {
  _id: string;
  name: string;
  slug: string;
  description: string;
  coverImage?: string;
  icon?: string;
  owner: Pick<IUser, '_id' | 'username' | 'displayName' | 'avatarUrl'>;
  memberCount: number;
  postCount: number;
  isPrivate: boolean;
  tags: string[];
  rules: string[];
  isMember?: boolean;
  memberRole?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IShowcasePost {
  _id: string;
  author: Pick<IUser, '_id' | 'username' | 'displayName' | 'avatarUrl' | 'isVerified'>;
  title: string;
  description: string;
  images: string[];
  tags: string[];
  links?: { live?: string; github?: string; demo?: string };
  upvotes: string[];
  voteScore: number;
  commentCount: number;
  isFeatured: boolean;
  isDeleted: boolean;
  hasUpvoted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface INotification {
  _id: string;
  recipient: string;
  sender?: Pick<IUser, '_id' | 'username' | 'displayName' | 'avatarUrl'> | null;
  type: string;
  entityId: string;
  entityType: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface IApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface IPaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: IPagination;
}
