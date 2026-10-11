import React, { useEffect } from 'react';
import { Outlet, createRootRoute, useMatches } from '@tanstack/react-router';
import { useIsNotFound } from '../common/utils/router';
import { Layouts } from '../common/layouts/Layouts';
import { Layout } from '../common/layouts/PrimaryLayout';
import { NavLayout } from '../common/layouts/NavLayout';
import { LoadPresetsLayout } from '../common/layouts/LoadPresetsLayout';
import { DynamicMetaTags } from '../common/components/DynamicMetaTags';
import { useApplyTheme } from '../common/hooks/useApplyTheme';
import { useGoatCounter } from '../common/hooks/useGoatCounter';
import { BetaRumNotice } from '../common/components/notices/BetaRumNotice';
import { initBetaRum } from '../common/utils/rum';

const PassThroughLayout = ({ children }: { children?: React.ReactNode }) => <>{children}</>;

const RootComponent = () => {
  useApplyTheme();
  useGoatCounter();
  useEffect(() => {
    initBetaRum();
  }, []);

  // Not-found pages bring their own layout; everything else names one in its route's staticData.
  const notFound = useIsNotFound();
  const layout = useMatches({
    select: (matches) => matches[matches.length - 1]?.staticData.layout,
  });
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

export const Route = createRootRoute({ component: RootComponent });
