import { useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { hrefToString } from '../../common/components/general/Link';
import { useSidebar } from '../../common/components/ui/sidebar';
import { useDelimitatedRoute } from '../../common/utils/router';
import { useCommandPaletteStore } from '../commandPalette/store';
import { useResolveCommand } from '../commandPalette/useResolveCommand';
import { useGuideStore } from './store';
import type { GuideChoice } from './tree';
import { pageNode, targetFor } from './tree';

/** Follows a choice: navigates if it goes somewhere, then shows its next node or closes. */
export const useGuideChoice = () => {
  const navigate = useNavigate();
  const resolve = useResolveCommand();
  const route = useDelimitatedRoute();
  const goTo = useGuideStore((state) => state.goTo);
  const close = useGuideStore((state) => state.close);
  const hide = useGuideStore((state) => state.hide);
  const openSearch = useCommandPaletteStore((state) => state.setOpen);
  const { isMobile, setOpenMobile } = useSidebar();

  return useCallback(
    (choice: GuideChoice) => {
      if (choice.go) {
        const href = resolve(targetFor(choice.go, route));
        if (href) {
          if (isMobile) setOpenMobile(false);
          void navigate({ href: hrefToString(href) });
        }
      }
      if (choice.hide) hide();
      else if (choice.next === 'close') close();
      else goTo(choice.next === 'here' ? pageNode(route.page, route.line) : choice.next);
      if (choice.openSearch) openSearch(true);
    },
    [resolve, route, isMobile, setOpenMobile, navigate, hide, close, goTo, openSearch]
  );
};
