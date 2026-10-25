import React, { useState } from 'react';

import { useDelimitatedRoute } from '../../../common/utils/router';
import { COMMUTER_RAIL_LINE_NAMES } from '../../../common/types/lines';
import type { LineShort } from '../../../common/types/lines';
import { useSubwayScorecardRows } from './scorecardRows';
import { useBusScorecardRows, BusMetricChart } from './busOverview';
import { useCrScorecardRows, CrMetricChart } from './crOverview';
import { MetricsScorecard } from './MetricsScorecard';
import { MetricChartCard } from './MetricChartCard';
import { SubwayMetricChart } from './SubwayMetricChart';
import { ServiceAlertsCard } from './ServiceAlertsCard';
import { AccessibilityCard } from './AccessibilityCard';
import type { MetricKey, ScorecardRow } from './types';

interface OverviewLayoutProps {
  rows: ScorecardRow[];
  isLoading: boolean;
  skeletonRows?: number;
  selectedMetric: MetricKey;
  onSelectMetric: (metric: MetricKey) => void;
  chart: React.ReactNode;
  cards: React.ReactNode;
}

const OverviewLayout: React.FC<OverviewLayoutProps> = ({ chart, cards, ...scorecard }) => (
  <div className="flex w-full flex-col gap-6 md:gap-8">
    <div className="flex flex-col gap-4">
      <MetricsScorecard {...scorecard} />
      <MetricChartCard metric={scorecard.selectedMetric}>{chart}</MetricChartCard>
    </div>
    {cards}
  </div>
);

const SubwayOverview: React.FC<{ lineShort: LineShort }> = ({ lineShort }) => {
  const { line } = useDelimitatedRoute();
  const { rows, isLoading } = useSubwayScorecardRows(line, lineShort);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('speed');

  return (
    <OverviewLayout
      rows={rows}
      isLoading={isLoading}
      selectedMetric={selectedMetric}
      onSelectMetric={setSelectedMetric}
      chart={<SubwayMetricChart metric={selectedMetric} />}
      cards={
        <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
          <ServiceAlertsCard lineShort={lineShort} label={`the ${lineShort} Line`} />
          <AccessibilityCard lineShort={lineShort} />
        </div>
      }
    />
  );
};

const BusOverview: React.FC = () => {
  const { query } = useDelimitatedRoute();
  const busRoute = query.busRoute ?? '1';
  const { rows, isLoading } = useBusScorecardRows(busRoute);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('speed');

  return (
    <OverviewLayout
      rows={rows}
      isLoading={isLoading}
      skeletonRows={2}
      selectedMetric={selectedMetric}
      onSelectMetric={setSelectedMetric}
      chart={<BusMetricChart metric={selectedMetric} busRoute={busRoute} />}
      cards={<ServiceAlertsCard lineShort="Bus" busRoute={busRoute} label={`Route ${busRoute}`} />}
    />
  );
};

const CommuterRailOverview: React.FC = () => {
  const { query } = useDelimitatedRoute();
  const crRoute = query.crRoute ?? 'CR-Fairmount';
  const { rows, isLoading } = useCrScorecardRows(crRoute);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('ridership');

  return (
    <OverviewLayout
      rows={rows}
      isLoading={isLoading}
      skeletonRows={2}
      selectedMetric={selectedMetric}
      onSelectMetric={setSelectedMetric}
      chart={<CrMetricChart metric={selectedMetric} crRoute={crRoute} />}
      cards={
        <ServiceAlertsCard
          lineShort="Commuter Rail"
          crRoute={crRoute}
          label={`the ${COMMUTER_RAIL_LINE_NAMES[crRoute]}`}
        />
      }
    />
  );
};

/** Design-doc option 2b: verdict + scorecard + one chart, replacing the 4-card grid.
 * Each mode picks its own scorecard rows and charts; the layout is shared. */
export const OverviewRedesign: React.FC = () => {
  const { tab, lineShort } = useDelimitatedRoute();

  if (tab === 'Bus') return <BusOverview />;
  if (tab === 'Commuter Rail') return <CommuterRailOverview />;
  if (tab !== 'Subway' || !lineShort) return null;
  return <SubwayOverview lineShort={lineShort} />;
};
