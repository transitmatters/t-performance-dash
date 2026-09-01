'use client';

import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  BarElement,
  BarController,
  LineController,
} from 'chart.js';
import Annotation from 'chartjs-plugin-annotation';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { GCScript } from 'next-goatcounter';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import '../styles/dashboard.css';
import '../styles/globals.css';
import { Layouts } from '../common/layouts/Layouts';
import { Layout } from '../common/layouts/PrimaryLayout';

import { PRODUCTION } from '../common/utils/constants';
import { NavLayout } from '../common/layouts/NavLayout';
import { LoadPresetsLayout } from '../common/layouts/LoadPresetsLayout';
import { DynamicMetaTags } from '../common/components/DynamicMetaTags';
import { useApplyTheme } from '../common/hooks/useApplyTheme';

config.autoAddCss = false;

ChartJS.register(
  BarController,
  BarElement,
  LineController,
  CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Annotation,
  ChartDataLabels,
  Filler,
  Title,
  Tooltip,
  Legend
);

// Vertical gridlines add noise without helping anyone compare values, so drop them for every
// chart at once rather than per-config — the x axis is a time or category scale throughout.
(['time', 'timeseries', 'category'] as const).forEach((scaleType) => {
  const scale = ChartJS.defaults.scales[scaleType];
  if (scale) scale.grid = { ...scale.grid, display: false };
});

// Keep the remaining horizontal rules recessive. A neutral gray at low alpha reads on both the
// light and dark grounds — a near-black rule vanishes on the dark theme.
if (ChartJS.defaults.scales.linear) {
  ChartJS.defaults.scales.linear.grid = {
    ...ChartJS.defaults.scales.linear.grid,
    color: 'rgba(128,128,128,0.16)',
  };
}

// ChartDataLabels plugin defaults to displaying on every chart.
if (ChartJS.defaults.plugins.datalabels?.display)
  ChartJS.defaults.plugins.datalabels.display = false;

interface AppProps {
  Component: React.ComponentType & { Layout?: keyof typeof Layouts };
  pageProps: Record<string, unknown>;
}

export default function App({ Component, pageProps }: AppProps) {
  const isProd = typeof window !== 'undefined' && window.location.hostname === PRODUCTION;

  useApplyTheme();

  const [loaded, setLoaded] = useState(false);

  const SecondaryLayout: (typeof Layouts)[keyof typeof Layouts] | ((page: any) => any) | undefined =
    React.useMemo(() => {
      if (Component.Layout) {
        return Layouts[Component.Layout];
      }
      return (page) => page;
    }, [Component.Layout]);

  // Don't load on the server. This prevents hydration errors between mobile/desktop layouts.
  useEffect(() => {
    setLoaded(true);
  }, []);
  if (!loaded) return <DynamicMetaTags />;

  return (
    <Layout>
      <LoadPresetsLayout>
        <NavLayout>
          <SecondaryLayout>
            {isProd && <GCScript siteUrl={'https://transitmatters-dd.goatcounter.com/count'} />}
            <Component {...pageProps} />
          </SecondaryLayout>
        </NavLayout>
      </LoadPresetsLayout>
    </Layout>
  );
}
