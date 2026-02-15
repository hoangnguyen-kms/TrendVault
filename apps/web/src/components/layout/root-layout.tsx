import { Suspense } from 'react';
import { Outlet, Navigate } from 'react-router';
import { useCurrentUser } from '@/hooks/use-auth';
import { AppSidebar } from './app-sidebar';
import { AppHeader } from './app-header';

export default function RootLayout() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center">
                <div className="text-lg">Loading...</div>
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
