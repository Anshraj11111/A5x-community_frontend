import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { AdminShell } from '@/components/admin/AdminShell';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminGuard } from './AdminGuard';
import { PageLoader } from '@/components/common/LoadingSpinner';

// ── Community pages ────────────────────────────────────────────────────────────
const HomePage           = lazy(() => import('@/pages/home/HomePage'));
const LoginPage          = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage       = lazy(() => import('@/pages/auth/RegisterPage'));
const FounderLoginPage   = lazy(() => import('@/pages/auth/FounderLoginPage'));
const DiscussionsPage    = lazy(() => import('@/pages/discussions/DiscussionsPage'));
const PostDetailPage     = lazy(() => import('@/pages/discussions/PostDetailPage'));
const CreatePostPage     = lazy(() => import('@/pages/discussions/CreatePostPage'));
const FeaturesPage       = lazy(() => import('@/pages/features/FeaturesPage'));
const BugsPage           = lazy(() => import('@/pages/bugs/BugsPage'));
const ShowcasePage        = lazy(() => import('@/pages/showcase/ShowcasePage'));
const ShowcaseDetailPage  = lazy(() => import('@/pages/showcase/ShowcaseDetailPage'));
const ChampionshipPage    = lazy(() => import('@/pages/championship/ChampionshipPage'));
const ClubsPage           = lazy(() => import('@/pages/clubs/ClubsPage'));
const ClubDetailPage      = lazy(() => import('@/pages/clubs/ClubDetailPage'));
const NotificationsPage  = lazy(() => import('@/pages/notifications/NotificationsPage'));
const ProfilePage        = lazy(() => import('@/pages/profile/ProfilePage'));
const SettingsPage       = lazy(() => import('@/pages/settings/SettingsPage'));
const FoundersDeskPage   = lazy(() => import('@/pages/founders/FoundersDeskPage'));
const EventsPage         = lazy(() => import('@/pages/events/EventsPage'));
const ProductJourneyPage = lazy(() => import('@/pages/journey/ProductJourneyPage'));
const NotFoundPage       = lazy(() => import('@/pages/errors/NotFoundPage'));

// ── Admin pages ────────────────────────────────────────────────────────────────
const AdminLoginPage         = lazy(() => import('@/pages/admin/AdminLoginPage'));
const AdminRegisterPage      = lazy(() => import('@/pages/admin/AdminRegisterPage'));
const AdminDashboard         = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminUsersPage         = lazy(() => import('@/pages/admin/AdminUsersPage'));
const AdminContentPage       = lazy(() => import('@/pages/admin/AdminContentPage'));
const AdminReportsPage       = lazy(() => import('@/pages/admin/AdminReportsPage'));
const AdminFeaturesPage      = lazy(() => import('@/pages/admin/AdminFeaturesPage'));
const AdminBugsPage          = lazy(() => import('@/pages/admin/AdminBugsPage'));
const AdminClubsPage         = lazy(() => import('@/pages/admin/AdminClubsPage'));
const AdminEventsPage        = lazy(() => import('@/pages/admin/AdminEventsPage'));
const AdminFoundersPage      = lazy(() => import('@/pages/admin/AdminFoundersPage'));
const AdminNotificationsPage = lazy(() => import('@/pages/admin/AdminNotificationsPage'));
const AdminAnalyticsPage     = lazy(() => import('@/pages/admin/AdminAnalyticsPage'));
const AdminAuditPage         = lazy(() => import('@/pages/admin/AdminAuditPage'));
const AdminSettingsPage      = lazy(() => import('@/pages/admin/AdminSettingsPage'));
const AdminClubRequestsPage  = lazy(() => import('@/pages/admin/AdminClubRequestsPage'));
const AdminTasksPage         = lazy(() => import('@/pages/admin/AdminTasksPage'));
const ClubTasksPage          = lazy(() => import('@/pages/tasks/ClubTasksPage'));

const wrap = (element: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
);

const router = createBrowserRouter(
  [
    // ── Admin login/register (standalone, no shell) ─────────────────────────
    { path: '/admin/login',    element: wrap(<AdminLoginPage />) },
    { path: '/admin/register', element: wrap(<AdminRegisterPage />) },
    { path: '/founder',        element: wrap(<FounderLoginPage />) },

    // ── Admin panel (AdminShell + AdminGuard) ────────────────────────────────
    {
      path: '/admin',
      element: <AdminGuard><AdminShell /></AdminGuard>,
      children: [
        { index: true,           element: wrap(<AdminDashboard />) },
        { path: 'dashboard',     element: wrap(<AdminDashboard />) },
        { path: 'users',         element: wrap(<AdminUsersPage />) },
        { path: 'content',       element: wrap(<AdminContentPage />) },
        { path: 'reports',       element: wrap(<AdminReportsPage />) },
        { path: 'features',      element: wrap(<AdminFeaturesPage />) },
        { path: 'bugs',           element: wrap(<AdminBugsPage />) },
        { path: 'clubs',          element: wrap(<AdminClubsPage />) },
        { path: 'events',         element: wrap(<AdminEventsPage />) },
        { path: 'founders',      element: wrap(<AdminFoundersPage />) },
        { path: 'notifications', element: wrap(<AdminNotificationsPage />) },
        { path: 'analytics',     element: wrap(<AdminAnalyticsPage />) },
        { path: 'audit',          element: wrap(<AdminAuditPage />) },
        { path: 'settings',       element: wrap(<AdminSettingsPage />) },
        { path: 'club-requests',  element: wrap(<AdminClubRequestsPage />) },
        { path: 'tasks',          element: wrap(<AdminTasksPage />) },
      ],
    },

    // ── Community app (AppShell) ─────────────────────────────────────────────
    {
      path: '/',
      element: <AppShell />,
      children: [
        { index: true,             element: wrap(<HomePage />) },
        { path: 'login',           element: wrap(<LoginPage />) },
        { path: 'register',        element: wrap(<RegisterPage />) },
        { path: 'discussions',     element: wrap(<DiscussionsPage />) },
        { path: 'discussions/new', element: wrap(<ProtectedRoute><CreatePostPage /></ProtectedRoute>) },
        { path: 'discussions/:id', element: wrap(<PostDetailPage />) },
        { path: 'features',        element: wrap(<FeaturesPage />) },
        { path: 'bugs',            element: wrap(<ProtectedRoute><BugsPage /></ProtectedRoute>) },
        { path: 'showcase',        element: wrap(<ShowcasePage />) },
        { path: 'showcase/:id',    element: wrap(<ShowcaseDetailPage />) },
        { path: 'clubs',           element: wrap(<ClubsPage />) },
        { path: 'clubs/:slug',     element: wrap(<ClubDetailPage />) },
        { path: 'championship',    element: wrap(<ChampionshipPage />) },
        { path: 'club-tasks',      element: wrap(<ClubTasksPage />) },
        { path: 'founders-desk',   element: wrap(<FoundersDeskPage />) },
        { path: 'events',          element: wrap(<EventsPage />) },
        { path: 'journey',         element: wrap(<ProductJourneyPage />) },
        { path: 'notifications',   element: wrap(<ProtectedRoute><NotificationsPage /></ProtectedRoute>) },
        { path: 'u/:username',     element: wrap(<ProfilePage />) },
        { path: 'settings',        element: wrap(<ProtectedRoute><SettingsPage /></ProtectedRoute>) },
        { path: '*',               element: wrap(<NotFoundPage />) },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

export function AppRouter() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
}
