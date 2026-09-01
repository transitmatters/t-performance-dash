import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

/**
 * Light/dark theme, persisted to localStorage under `tm-theme`. The no-FOUC script in
 * pages/_document.tsx reads the same key to set the `dark` class before first paint; this store
 * is the source of truth after hydration (see useApplyTheme).
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      toggle: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
    }),
    { name: 'tm-theme' }
  )
);
