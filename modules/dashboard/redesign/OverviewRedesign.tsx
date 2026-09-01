import React, { useState } from 'react';

import { useDelimitatedRoute } from '../../../common/utils/router';
import { useScorecardRows } from './scorecardRows';
import { MetricsScorecard } from './MetricsScorecard';
import { MetricChartCard } from './MetricChartCard';
import { ServiceAlertsCard } from './ServiceAlertsCard';
import { AccessibilityCard } from './AccessibilityCard';
import type { MetricKey } from './types';

/** Design-doc option 2b: verdict + scorecard + one chart, replacing the 4-card grid.
 * Reachable at `?redesign=1` on the existing Overview route — see modules/dashboard/Overview.tsx. */
export const OverviewRedesign: React.FC = () => {
  const { tab, line, lineShort } = useDelimitatedRoute();
  const { rows, isLoading } = useScorecardRows(line, lineShort);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('speed');

  if (tab !== 'Subway' || !lineShort) return null;

  return (
    <div className="flex w-full flex-col gap-4">
      <MetricsScorecard
        rows={rows}
        isLoading={isLoading}
        selectedMetric={selectedMetric}
        onSelectMetric={setSelectedMetric}
      />
      <MetricChartCard metric={selectedMetric} />
      <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
        <ServiceAlertsCard lineShort={lineShort} />
        <AccessibilityCard lineShort={lineShort} />
      </div>
    </div>
  );
};
