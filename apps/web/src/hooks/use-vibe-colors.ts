import { useMemo } from 'react';
import { useThemeStore } from '@/stores/theme-store';

/** Reads computed Vibe CSS custom properties and returns hex values
 *  for use in Recharts (which cannot resolve CSS vars in SVG props).
 *  Re-computes when the theme changes so charts update on toggle. */
export function useVibeColors() {
  const { theme } = useThemeStore();

  return useMemo(() => {
    const root = document.documentElement;
    const get = (name: string) => getComputedStyle(root).getPropertyValue(name).trim();

    return {
      primary: get('--primary-color'),
      primaryHover: get('--primary-hover-color'),
      positive: get('--positive-color'),
      negative: get('--negative-color'),
      warning: get('--warning-color'),
      textPrimary: get('--primary-text-color'),
      textSecondary: get('--secondary-text-color'),
      bgPrimary: get('--primary-background-color'),
      border: get('--ui-border-color'),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-read on theme toggle
  }, [theme]);
}
