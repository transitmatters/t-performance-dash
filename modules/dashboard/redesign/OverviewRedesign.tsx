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
    // Full-width, with a deliberate rhythm: the metrics unit (scorecard + the chart it drives) reads
    // tight together, then generous separation before the "current conditions" group below.
    <div className="flex w-full flex-col gap-6 md:gap-8">
      <div className="flex flex-col gap-4">
        <MetricsScorecard
          rows={rows}
          isLoading={isLoading}
          selectedMetric={selectedMetric}
          onSelectMetric={setSelectedMetric}
        />
        {/* SAFETY: CSS custom properties (--*) are valid CSS but absent from React.CSSProperties; the cast lets them pass to the DOM. */}
        <div className="tm-reveal" style={{ '--reveal-index': 4 } as React.CSSProperties}>
          <MetricChartCard metric={selectedMetric} />
        </div>
      </div>
      {/* SAFETY: CSS custom properties (--*) are valid CSS but absent from React.CSSProperties; the cast lets them pass to the DOM. */}
      <div
        className="tm-reveal grid w-full grid-cols-1 gap-4 lg:grid-cols-2"
        style={{ '--reveal-index': 5 } as React.CSSProperties}
      >
        <ServiceAlertsCard lineShort={lineShort} />
        <AccessibilityCard lineShort={lineShort} />
      </div>
    </div>
  );
};
