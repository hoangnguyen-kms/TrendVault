import { createBrowserRouter } from 'react-router';
import { lazy, Suspense } from 'react';

const LoginPage = lazy(() => import('@/pages/auth/login-page'));
const RegisterPage = lazy(() => import('@/pages/auth/register-page'));
const RootLayout = lazy(() => import('@/components/layout/root-layout'));
const DashboardPage = lazy(() => import('@/pages/dashboard-page'));
const TrendingPage = lazy(() => import('@/pages/trending/trending-page'));

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
    ],
  },
]);
