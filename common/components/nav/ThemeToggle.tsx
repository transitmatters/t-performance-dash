import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../state/themeStore';
import { Button } from '../ui/button';

/** Light/dark toggle. Shows the icon of the theme you'd switch TO. */
export const ThemeToggle: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);
  const toggle = useThemeStore((state) => state.toggle);
  const nextIsDark = theme === 'light';
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      aria-label={`Switch to ${nextIsDark ? 'dark' : 'light'} theme`}
      className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground w-full justify-start gap-2"
    >
      {nextIsDark ? <Moon /> : <Sun />}
      <span>{nextIsDark ? 'Dark mode' : 'Light mode'}</span>
    </Button>
  );
};
