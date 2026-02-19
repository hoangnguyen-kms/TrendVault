import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.toggle('dark', isDark);
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
    }),
    { name: 'trendvault-theme' },
  ),
);

/** Listen for OS-level theme changes when mode is 'system' */
export function listenToSystemTheme() {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => {
    const { theme } = useThemeStore.getState();
    if (theme === 'system') applyTheme('system');
  };
  mediaQuery.addEventListener('change', handler);
  return () => mediaQuery.removeEventListener('change', handler);
}

/** Apply persisted theme before first render to prevent flash */
export function initializeTheme() {
  try {
    const stored = JSON.parse(localStorage.getItem('trendvault-theme') || '{}');
    applyTheme(stored?.state?.theme || 'system');
  } catch {
    applyTheme('system');
  }
}

/** Bridge Zustand theme state to Vibe ThemeProvider's systemTheme prop */
export function useVibeTheme(): 'light' | 'dark' | undefined {
  const { theme } = useThemeStore();
  if (theme === 'system') return undefined; // let Vibe use OS preference
  return theme;
}
