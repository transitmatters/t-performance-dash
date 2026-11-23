import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Outlet, createRootRoute, useMatches } from '@tanstack/react-router';
import { usePageRoute, useIsNotFound } from '../common/utils/router';
import { Layouts } from '../common/layouts/Layouts';
import { AppProviders } from '../common/layouts/AppProviders';
import { NavLayout } from '../common/layouts/NavLayout';
import { DynamicMetaTags } from '../common/components/DynamicMetaTags';
import { useApplyTheme } from '../common/hooks/useApplyTheme';
import { useGoatCounter } from '../common/hooks/useGoatCounter';
import { BetaNotices } from '../common/components/notices/BetaNotices';
import { initBetaRum } from '../common/utils/rum';
import { redirectToCanonicalSearch } from '../common/utils/dateParams';
import { useColorVisionKey } from '../common/utils/colorVision';

const PassThroughLayout = ({ children }: { children?: ReactNode }) => <>{children}</>;

const RootComponent = () => {
  // Not-found pages bring their own layout; everything else names one in its route's staticData.
  const notFound = useIsNotFound();
  const { layout, embed } = useMatches({
    select: (matches) => matches[matches.length - 1]?.staticData ?? {},
  });
  // An embed's host page picks its theme (light unless `?theme=dark`), not the visitor's preference.
  const { theme } = usePageRoute().query;
  useApplyTheme(embed ? (theme === 'dark' ? 'dark' : 'light') : undefined);
  // Remount the page when colorblind mode flips, so charts redraw in its palette
  const colorVisionKey = useColorVisionKey();
  useGoatCounter();
  useEffect(() => {
    void initBetaRum();
  }, []);

  if (embed && !notFound) {
    return (
      <AppProviders>
        <Outlet key={colorVisionKey} />
      </AppProviders>
    );
  }

  const SecondaryLayout = layout && !notFound ? Layouts[layout] : PassThroughLayout;

  return (
    <AppProviders>
      <DynamicMetaTags />
      <NavLayout>
        <SecondaryLayout key={colorVisionKey}>
          <Outlet />
        </SecondaryLayout>
        <BetaNotices />
      </NavLayout>
    </AppProviders>
  );
};

export const Route = createRootRoute({
  beforeLoad: redirectToCanonicalSearch,
  component: RootComponent,
});
