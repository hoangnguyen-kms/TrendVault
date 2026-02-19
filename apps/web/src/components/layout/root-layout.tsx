import { Suspense } from 'react';
import { Outlet, Navigate } from 'react-router';
import { useCurrentUser } from '@/hooks/use-auth';
import { needsTosAcceptance } from '@/hooks/use-tos-guard';
import { TosAcceptanceModal } from '@/components/tos/tos-acceptance-modal';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { AppSidebar } from './app-sidebar';
import { AppHeader } from './app-header';

export default function RootLayout() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div style={{ font: 'var(--font-text1-normal)', color: 'var(--secondary-text-color)' }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const showTosModal = needsTosAcceptance(user);

  return (
    <>
      <TosAcceptanceModal isOpen={showTosModal} />
      <div className="flex h-screen" style={{ backgroundColor: 'var(--allgrey-background-color)' }}>
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-y-auto p-6">
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </>
  );
}
