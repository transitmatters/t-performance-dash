import type { ReactNode } from 'react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../../common/components/ui/card';
import type { MetricKey } from './types';

export type MetricCopy = Partial<Record<MetricKey, { title: string; subtitle: string }>>;

interface MetricChartCardProps {
  metric: MetricKey;
  /** Overrides the default title and subtitle for some metrics */
  copy?: MetricCopy;
  children: ReactNode;
}

const METRIC_COPY: Required<MetricCopy> = {
  speed: { title: 'Speed', subtitle: 'Daily average, last 30 days' },
  service: { title: 'Service delivered', subtitle: 'Daily round trips, last 30 days' },
  slowzones: { title: 'Slow zones', subtitle: 'Time lost to slow zones, last 30 days' },
  ridership: { title: 'Ridership', subtitle: 'Fare validations, last 30 days' },
  delays: { title: 'Alert delays', subtitle: 'Daily time delayed per MBTA alerts, last 30 days' },
  reliability: { title: 'Reliability', subtitle: 'Share of headways, last 30 days' },
};

/** The single chart the scorecard drives — clicking a row swaps which metric renders here. */
export const MetricChartCard = ({ metric, copy, children }: MetricChartCardProps) => {
  const { title, subtitle } = copy?.[metric] ?? METRIC_COPY[metric];
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
