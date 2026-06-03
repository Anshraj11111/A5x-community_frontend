export const APP_NAME = 'A5X Community';
export const APP_DESCRIPTION = 'The premium community for A5X product enthusiasts';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DISCUSSIONS: '/discussions',
  POST: '/discussions/:id',
  CREATE_POST: '/discussions/new',
  FEATURES: '/features',
  BUGS: '/bugs',
  SHOWCASE: '/showcase',
  CLUBS: '/clubs',
  CLUB: '/clubs/:slug',
  NOTIFICATIONS: '/notifications',
  PROFILE: '/u/:username',
  SETTINGS: '/settings',
  ADMIN: '/admin',
} as const;

export const QUERY_KEYS = {
  POSTS: 'posts',
  POST: 'post',
  COMMENTS: 'comments',
  FEATURES: 'features',
  BUGS: 'bugs',
  CLUBS: 'clubs',
  CLUB: 'club',
  SHOWCASE: 'showcase',
  NOTIFICATIONS: 'notifications',
  UNREAD_COUNT: 'unread-count',
  PROFILE: 'profile',
  USER_POSTS: 'user-posts',
  STATS: 'admin-stats',
} as const;
