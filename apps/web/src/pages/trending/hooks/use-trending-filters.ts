import { create } from 'zustand';

interface TrendingFiltersState {
  platform: 'ALL' | 'YOUTUBE' | 'TIKTOK';
  region: string;
  category: string | null;
  autoRefresh: boolean;
  refreshInterval: number; // ms
  setPlatform: (platform: 'ALL' | 'YOUTUBE' | 'TIKTOK') => void;
  setRegion: (region: string) => void;
  setCategory: (category: string | null) => void;
  toggleAutoRefresh: () => void;
  setRefreshInterval: (ms: number) => void;
}

export const useTrendingFilters = create<TrendingFiltersState>((set) => ({
  platform: 'ALL',
  region: 'US',
  category: null,
  autoRefresh: false,
  refreshInterval: 300_000, // 5 min
  setPlatform: (platform) => set({ platform, category: null }),
  setRegion: (region) => set({ region }),
  setCategory: (category) => set({ category }),
  toggleAutoRefresh: () => set((s) => ({ autoRefresh: !s.autoRefresh })),
  setRefreshInterval: (refreshInterval) => set({ refreshInterval }),
}));
