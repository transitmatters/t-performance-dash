import { useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { hrefToString } from '../../common/components/general/Link';
import { useSidebar } from '../../common/components/ui/sidebar';
import { useThemeStore } from '../../common/state/themeStore';
import type { Command } from './commandIndex';
import { useCommandPaletteStore, useRecentCommandsStore } from './store';
import { useResolveCommand } from './useResolveCommand';

/** Runs a palette command: navigates to it, or performs its action, then closes the palette. */
export const useRunCommand = () => {
  const navigate = useNavigate();
  const resolve = useResolveCommand();
  const setOpen = useCommandPaletteStore((state) => state.setOpen);
  const addRecent = useRecentCommandsStore((state) => state.add);
  const toggleTheme = useThemeStore((state) => state.toggle);
  const { isMobile, setOpenMobile, toggleSidebar } = useSidebar();

  return useCallback(
    (command: Command) => {
      setOpen(false);
      const { target } = command;
      if (target.kind === 'action') {
        if (target.action === 'theme') toggleTheme();
        if (target.action === 'sidebar') toggleSidebar();
        if (target.action === 'copyLink') void navigator.clipboard?.writeText(window.location.href);
        return;
      }
      addRecent(command.id);
      const href = resolve(target);
      if (!href) return;
      if (isMobile) setOpenMobile(false);
      void navigate({ href: hrefToString(href) });
    },
    [setOpen, addRecent, resolve, navigate, toggleTheme, toggleSidebar, isMobile, setOpenMobile]
  );
};
