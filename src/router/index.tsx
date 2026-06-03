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
const DiscussionsPage    = lazy(() => import('@/pages/discussions/DiscussionsPage'));
const PostDetailPage     = lazy(() => import('@/pages/discussions/PostDetailPage'));
const CreatePostPage     = lazy(() => import('@/pages/discussions/CreatePostPage'));
const FeaturesPage       = lazy(() => import('@/pages/features/FeaturesPage'));
const BugsPage           = lazy(() => import('@/pages/bugs/BugsPage'));
const ShowcasePage       = lazy(() => import('@/pages/showcase/ShowcasePage'));
const ShowcaseDetailPage = lazy(() => import('@/pages/showcase/ShowcaseDetailPage'));
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
const AdminEventsPage        = lazy(() => import('@/pages/admin/AdminEventsPage'));
const AdminFoundersPage      = lazy(() => import('@/pages/admin/AdminFoundersPage'));
const AdminNotificationsPage = lazy(() => import('@/pages/admin/AdminNotificationsPage'));
const AdminAnalyticsPage     = lazy(() => import('@/pages/admin/AdminAnalyticsPage'));
const AdminAuditPage         = lazy(() => import('@/pages/admin/AdminAuditPage'));
const AdminSettingsPage      = lazy(() => import('@/pages/admin/AdminSettingsPage'));

const wrap = (element: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
);

const router = createBrowserRouter(
  [
    // ── Admin login/register (standalone, no shell) ─────────────────────────
    { path: '/admin/login',    element: wrap(<AdminLoginPage />) },
    { path: '/admin/register', element: wrap(<AdminRegisterPage />) },

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
        { path: 'bugs',          element: wrap(<AdminBugsPage />) },
        { path: 'events',        element: wrap(<AdminEventsPage />) },
        { path: 'founders',      element: wrap(<AdminFoundersPage />) },
        { path: 'notifications', element: wrap(<AdminNotificationsPage />) },
        { path: 'analytics',     element: wrap(<AdminAnalyticsPage />) },
        { path: 'audit',         element: wrap(<AdminAuditPage />) },
        { path: 'settings',      element: wrap(<AdminSettingsPage />) },
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
