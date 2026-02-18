import { Toaster as Sonner } from 'sonner';
import { useThemeStore } from '@/stores/theme-store';

export function Toaster() {
  const { theme } = useThemeStore();

  return <Sonner theme={theme} position="bottom-right" richColors closeButton />;
}
