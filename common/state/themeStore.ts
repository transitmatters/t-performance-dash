import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
  /** Swap red/green-dependent colors for ones that stay apart with color vision deficiency. */
  colorblind: boolean;
  toggleColorblind: () => void;
}

/**
 * Light/dark theme and colorblind mode, persisted to localStorage under `tm-theme`. The no-FOUC
 * script in index.html reads the same key to set the `dark` class and `data-colorblind` before
 * first paint; this store is the source of truth after that (see useApplyTheme).
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      toggle: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
      colorblind: false,
      toggleColorblind: () => set({ colorblind: !get().colorblind }),
    }),
    { name: 'tm-theme' }
  )
);
