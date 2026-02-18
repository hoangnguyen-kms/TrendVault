import { create } from 'zustand';

interface TrendingFiltersState {
  platform: 'ALL' | 'YOUTUBE' | 'TIKTOK' | 'INSTAGRAM';
  region: string;
  category: string | null;
  autoRefresh: boolean;
  refreshInterval: number; // ms
  contentType: 'all' | 'shorts' | 'regular';
  setPlatform: (platform: 'ALL' | 'YOUTUBE' | 'TIKTOK' | 'INSTAGRAM') => void;
  setRegion: (region: string) => void;
  setCategory: (category: string | null) => void;
  toggleAutoRefresh: () => void;
  setRefreshInterval: (ms: number) => void;
  setContentType: (ct: 'all' | 'shorts' | 'regular') => void;
}

export const useTrendingFilters = create<TrendingFiltersState>((set) => ({
  platform: 'ALL',
  region: 'US',
  category: null,
  autoRefresh: false,
  refreshInterval: 300_000, // 5 min
  contentType: 'all',
  setPlatform: (platform) => set({ platform, category: null }),
  setRegion: (region) => set({ region }),
  setCategory: (category) => set({ category }),
  toggleAutoRefresh: () => set((s) => ({ autoRefresh: !s.autoRefresh })),
  setRefreshInterval: (refreshInterval) => set({ refreshInterval }),
  setContentType: (contentType) => set({ contentType }),
}));
