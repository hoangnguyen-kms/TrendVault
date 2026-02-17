import { createBrowserRouter } from 'react-router';
import { lazy, Suspense } from 'react';

const LoginPage = lazy(() => import('@/pages/auth/login-page'));
const RegisterPage = lazy(() => import('@/pages/auth/register-page'));
const RootLayout = lazy(() => import('@/components/layout/root-layout'));
const DashboardPage = lazy(() => import('@/pages/dashboard-page'));
const TrendingPage = lazy(() => import('@/pages/trending/trending-page'));
const DownloadsPage = lazy(() => import('@/pages/downloads/downloads-page'));
const UploadsPage = lazy(() => import('@/pages/uploads/uploads-page'));
const ConnectedAccountsPage = lazy(() => import('@/pages/settings/connected-accounts-page'));
const ChannelDashboardPage = lazy(() => import('@/pages/channels/channel-dashboard-page'));
const VideoDetailPage = lazy(() => import('@/pages/videos/video-detail-page'));
const CrossChannelPage = lazy(() => import('@/pages/analytics/cross-channel-page'));
const TermsOfServicePage = lazy(() => import('@/pages/legal/terms-of-service-page'));
const PrivacyPolicyPage = lazy(() => import('@/pages/legal/privacy-policy-page'));

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <SuspenseWrapper>
        <LoginPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/register',
    element: (
      <SuspenseWrapper>
        <RegisterPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/legal/terms-of-service',
    element: (
      <SuspenseWrapper>
        <TermsOfServicePage />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/legal/privacy-policy',
    element: (
      <SuspenseWrapper>
        <PrivacyPolicyPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/',
    element: (
      <SuspenseWrapper>
        <RootLayout />
      </SuspenseWrapper>
    ),
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'trending',
        element: (
          <SuspenseWrapper>
            <TrendingPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'downloads',
        element: (
          <SuspenseWrapper>
            <DownloadsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'uploads',
        element: (
          <SuspenseWrapper>
            <UploadsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'channels',
        element: (
          <SuspenseWrapper>
            <ChannelDashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'videos/:videoId',
        element: (
          <SuspenseWrapper>
            <VideoDetailPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'analytics',
        element: (
          <SuspenseWrapper>
            <CrossChannelPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'settings',
        element: (
          <SuspenseWrapper>
            <ConnectedAccountsPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
]);
