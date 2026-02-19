import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '@vibe/core';
import { queryClient } from '@/lib/query-client';
import { useVibeTheme } from '@/stores/theme-store';
import { router } from './router';
import { Toaster } from '@/components/ui/sonner';

export default function App() {
  const vibeTheme = useVibeTheme();
  return (
    <ThemeProvider systemTheme={vibeTheme}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
