import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../../state/themeStore';
import { Button } from '../ui/button';

/** Light/dark toggle. Shows the icon of the theme you'd switch TO. */
export const ThemeToggle: React.FC = () => {
  const { t } = useTranslation();
  const theme = useThemeStore((state) => state.theme);
  const toggle = useThemeStore((state) => state.toggle);
  const nextIsDark = theme === 'light';
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      aria-label={nextIsDark ? t('theme.switchToDark') : t('theme.switchToLight')}
      className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
    >
      {nextIsDark ? <Moon /> : <Sun />}
      <span>{nextIsDark ? t('theme.darkMode') : t('theme.lightMode')}</span>
    </Button>
  );
};
