import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Outlet, createRootRoute, useMatches } from '@tanstack/react-router';
import { useIsNotFound, useQueryParams } from '../common/utils/router';
import { Layouts } from '../common/layouts/Layouts';
import { Layout } from '../common/layouts/PrimaryLayout';
import { NavLayout } from '../common/layouts/NavLayout';
import { LoadPresetsLayout } from '../common/layouts/LoadPresetsLayout';
import { DynamicMetaTags } from '../common/components/DynamicMetaTags';
import { useApplyTheme } from '../common/hooks/useApplyTheme';
import { useGoatCounter } from '../common/hooks/useGoatCounter';
import { BetaRumNotice } from '../common/components/notices/BetaRumNotice';
import { initBetaRum } from '../common/utils/rum';
import { redirectToCompleteDates } from '../common/utils/dateParams';

const PassThroughLayout = ({ children }: { children?: ReactNode }) => <>{children}</>;

const RootComponent = () => {
  // Not-found pages bring their own layout; everything else names one in its route's staticData.
  const notFound = useIsNotFound();
  const { layout, embed } = useMatches({
    select: (matches) => matches[matches.length - 1]?.staticData ?? {},
  });
  // An embed's host page picks its theme (light unless `?theme=dark`), not the visitor's preference.
  const { theme } = useQueryParams();
  useApplyTheme(embed ? (theme === 'dark' ? 'dark' : 'light') : undefined);
  useGoatCounter();
  useEffect(() => {
    initBetaRum();
  }, []);

  if (embed && !notFound) {
    return (
      <Layout>
        <Outlet />
      </Layout>
    );
  }

  const SecondaryLayout = layout && !notFound ? Layouts[layout] : PassThroughLayout;

  return (
    <Layout>
      <DynamicMetaTags />
      <LoadPresetsLayout>
        <NavLayout>
          <SecondaryLayout>
            <Outlet />
          </SecondaryLayout>
          <BetaRumNotice />
        </NavLayout>
      </LoadPresetsLayout>
    </Layout>
  );
};

export const Route = createRootRoute({
  beforeLoad: redirectToCompleteDates,
  component: RootComponent,
});
