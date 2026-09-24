import { useEffect } from 'react';
import { useThemeStore } from '../state/themeStore';

/** Applies the persisted theme to <html> as the shadcn `dark` class. Call once, high in the tree. */
export const useApplyTheme = (): void => {
  const theme = useThemeStore((state) => state.theme);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
};
