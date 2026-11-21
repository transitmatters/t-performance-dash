import { useEffect } from 'react';
import type { Theme } from '../state/themeStore';
import { useThemeStore } from '../state/themeStore';

/**
 * Applies the persisted theme to <html> as the shadcn `dark` class, and colorblind mode as
 * `data-colorblind`. Call once, high in the tree. `override` wins over the persisted theme without
 * changing it, e.g. an embed's `?theme=`.
 */
export const useApplyTheme = (override?: Theme): void => {
  const persisted = useThemeStore((state) => state.theme);
  const colorblind = useThemeStore((state) => state.colorblind);
  const theme = override ?? persisted;
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  useEffect(() => {
    document.documentElement.toggleAttribute('data-colorblind', colorblind);
  }, [colorblind]);
};
