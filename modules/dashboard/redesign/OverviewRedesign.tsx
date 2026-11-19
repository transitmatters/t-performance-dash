import { useState } from 'react';
import type { ReactNode } from 'react';
import dayjs from 'dayjs';

import { useDelimitatedRoute } from '../../../common/utils/router';
import { Notice } from '../../../common/components/notices/Notice';
import {
  BUS_TRIP_METRICS_MIN_DATE,
  PRETTY_DATE_FORMAT,
  getBusRouteService,
} from '../../../common/constants/dates';
import { COMMUTER_RAIL_LINE_NAMES } from '../../../common/types/lines';
import type { LineShort } from '../../../common/types/lines';
import { useSubwayScorecardRows } from './scorecardRows';
import { useBusScorecardRows, BusMetricChart } from './busOverview';
import { hasBusReliability } from './busReliability';
import { useCrScorecardRows, useCrChartCopy, CrMetricChart } from './crOverview';
import { MetricsScorecard } from './MetricsScorecard';
import { getOverviewWindow } from './scorecardUtils';
import { MetricChartCard } from './MetricChartCard';
import type { MetricCopy } from './MetricChartCard';
import { SubwayMetricChart } from './SubwayMetricChart';
import { ServiceAlertsCard } from './ServiceAlertsCard';
import { AccessibilityCard } from './AccessibilityCard';
import type { MetricKey, ScorecardSlot } from './types';

interface OverviewLayoutProps {
  slots: ScorecardSlot[];
  color?: string;
  selectedMetric: MetricKey;
  onSelectMetric: (metric: MetricKey) => void;
  chart: ReactNode;
  chartCopy?: MetricCopy;
  cards: ReactNode;
}

const OverviewLayout = ({ chart, chartCopy, cards, ...scorecard }: OverviewLayoutProps) => (
  <div className="flex w-full flex-col gap-6 md:gap-8">
    <div className="flex flex-col gap-4">
      <MetricsScorecard {...scorecard} />
      <MetricChartCard metric={scorecard.selectedMetric} copy={chartCopy}>
        {chart}
      </MetricChartCard>
    </div>
    {cards}
  </div>
);

const SubwayOverview = ({ lineShort }: { lineShort: LineShort }) => {
  const { line } = useDelimitatedRoute();
  const { slots, color } = useSubwayScorecardRows(line, lineShort);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('speed');

  return (
    <OverviewLayout
      slots={slots}
      color={color}
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

// Bus uses how long delay alerts were up, not the delay they stated, and counts dropped trips
// rather than round trips
const BUS_CHART_COPY: MetricCopy = {
  service: { title: 'Service delivered', subtitle: 'Trips dropped per day (est.), last 30 days' },
  delays: { title: 'Delays', subtitle: 'Minutes a delay alert was up per day, last 30 days' },
};

// A retired route's charts end on its last day of service, so they don't say "last 30 days"
const RETIRED_BUS_CHART_COPY: MetricCopy = {
  speed: { title: 'Speed', subtitle: 'Daily average, final 30 days' },
  service: { title: 'Service delivered', subtitle: 'Trips dropped per day (est.), final 30 days' },
  ridership: { title: 'Ridership', subtitle: 'Fare validations, final 30 days' },
  delays: { title: 'Delays', subtitle: 'Minutes a delay alert was up per day, final 30 days' },
};

const BusOverview = () => {
  const { query } = useDelimitatedRoute();
  const busRoute = query.busRoute ?? '1';
  const service = getBusRouteService(busRoute);
  // A retired route's figures end on its last day of service, and none start before its first.
  const span = getOverviewWindow(service.retired ? service.end : undefined, service.start);
  // Routes retired before bus trip metrics start have only ridership and delays.
  const hasTripData = !service.retired || span.end >= BUS_TRIP_METRICS_MIN_DATE;
  const { slots, color } = useBusScorecardRows(busRoute, span, hasTripData);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>(
    hasTripData ? 'speed' : 'ridership'
  );
  const showsReliability = hasTripData && hasBusReliability(busRoute);
  // The page stays mounted when switching routes, so a route without the Reliability row falls back
  // to Speed rather than charting nothing.
  const metric = selectedMetric === 'reliability' && !showsReliability ? 'speed' : selectedMetric;

  const layout = (
    <OverviewLayout
      slots={slots}
      color={color}
      selectedMetric={metric}
      onSelectMetric={setSelectedMetric}
      chart={
        <BusMetricChart metric={metric} busRoute={busRoute} span={span} retired={service.retired} />
      }
      chartCopy={service.retired ? RETIRED_BUS_CHART_COPY : BUS_CHART_COPY}
      // A retired route has no alerts of its own; its route_ids' alerts are its replacement's.
      cards={
        !service.retired && (
          <ServiceAlertsCard lineShort="Bus" busRoute={busRoute} label={`Route ${busRoute}`} />
        )
      }
    />
  );
  if (!service.retired) return layout;
  return (
    <div className="flex w-full flex-col gap-4">
      <Notice title="This route no longer runs">
        Its last day of service was {dayjs(span.end).format(PRETTY_DATE_FORMAT)}, so these figures
        cover its final weeks rather than the last 30 days.
        {!hasTripData &&
          ` Our bus speed and service data start in ${dayjs(BUS_TRIP_METRICS_MIN_DATE).format('MMMM YYYY')}, so only ridership and delays are shown.`}
      </Notice>
      {layout}
    </div>
  );
};

const CommuterRailOverview = () => {
  const { query } = useDelimitatedRoute();
  const crRoute = query.crRoute ?? 'CR-Fairmount';
  const { slots, color } = useCrScorecardRows(crRoute);
  const chartCopy = useCrChartCopy(crRoute);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('ridership');

  return (
    <OverviewLayout
      slots={slots}
      color={color}
      selectedMetric={selectedMetric}
      onSelectMetric={setSelectedMetric}
      chart={<CrMetricChart metric={selectedMetric} crRoute={crRoute} />}
      chartCopy={chartCopy}
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
 * Each mode picks its own scorecard rows and charts; the layout is shared. Each is keyed by its
 * line or route so the picked metric starts over on a switch: a metric picked on one line would
 * otherwise stay charted on another whose scorecard has no such row. */
export const OverviewRedesign = () => {
  const { tab, lineShort, query } = useDelimitatedRoute();

  if (tab === 'Bus') return <BusOverview key={query.busRoute} />;
  if (tab === 'Commuter Rail') return <CommuterRailOverview key={query.crRoute} />;
  if (tab !== 'Subway' || !lineShort) return null;
  return <SubwayOverview key={lineShort} lineShort={lineShort} />;
};
