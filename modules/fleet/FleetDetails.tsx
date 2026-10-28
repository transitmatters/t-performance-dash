'use client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useDelimitatedRoute } from '../../common/utils/router';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { useDeliveredTripMetrics } from '../../common/api/hooks/tripmetrics';
import { useBusTripMetrics } from '../../common/api/hooks/busTripMetrics';
import { useCrTripMetrics } from '../../common/api/hooks/crTripMetrics';
import { Widget } from '../../common/components/widgets';
import {
  StatCard,
  StatCardGrid,
  type StatSentiment,
} from '../../common/components/widgets/StatCard';
import { getBusRouteIds } from '../../common/constants/lines';
import { useChartToggle } from '../../common/hooks/useChartToggle';
import { COMMUTER_RAIL_LINE_NAMES } from '../../common/types/lines';
import { getSpeedGraphConfig } from '../speed/constants/speeds';
import { FleetAgeGraphWrapper } from './FleetAgeGraphWrapper';
import { FleetShareGraphWrapper } from './FleetShareGraphWrapper';
import { FleetMixGraphWrapper } from './FleetMixGraphWrapper';
import { FLEET_TYPES, getFleetModeMetrics } from './constants/fleetTypes';
import { getFleetStats } from './utils/fleetStats';

dayjs.extend(utc);

// data-ingestion's system-wide row for bus and Commuter Rail.
const SYSTEM_WIDE_ROUTE = 'all';

export function FleetDetails() {
  const {
    line,
    query: { startDate, endDate, busRoute, crRoute },
  } = useDelimitatedRoute();
  const config = getSpeedGraphConfig(dayjs(startDate), dayjs(endDate));
  const isBus = line === 'line-bus';
  const isCommuterRail = line === 'line-commuter-rail';
  const isRail = !isBus && !isCommuterRail;
  const selectedRoute = isBus ? busRoute : isCommuterRail ? crRoute : undefined;
  const routeLabel = isBus
    ? `Route ${busRoute}`
    : (COMMUTER_RAIL_LINE_NAMES[crRoute!] ?? crRoute ?? '');
  // Commuter Rail calls its routes lines, as on the Reliability page.
  const allLabel = isCommuterRail ? 'All lines' : 'All routes';
  // Follows the route picked in the header, like the other bus and CR pages.
  const { value: scope, control: scopeControl } = useChartToggle(
    'route',
    [
      ['route', routeLabel],
      ['all', allLabel],
    ],
    { paramKey: 'fleetScope' }
  );
  const byRoute = scope === 'route' && Boolean(selectedRoute);
  const route = byRoute ? selectedRoute : SYSTEM_WIDE_ROUTE;
  const enabled = Boolean(startDate && endDate && line && config.agg);

  const railMetrics = useDeliveredTripMetrics(
    { start_date: startDate, end_date: endDate, agg: config.agg, line },
    enabled && isRail
  );
  const busMetrics = useBusTripMetrics(
    {
      start_date: startDate,
      end_date: endDate,
      agg: config.agg,
      route: byRoute && busRoute ? getBusRouteIds(busRoute).join(',') : route,
    },
    enabled && isBus
  );
  const crMetrics = useCrTripMetrics(
    { start_date: startDate, end_date: endDate, agg: config.agg, route },
    enabled && isCommuterRail
  );
  const fleetMetrics = isBus ? busMetrics : isCommuterRail ? crMetrics : railMetrics;

  const fleetTypes = line ? FLEET_TYPES[line] : undefined;
  const metrics = getFleetModeMetrics(line);
  const scopeLabel = byRoute ? routeLabel : allLabel;
  const subtitle = (railSubtitle: string) => (isRail ? railSubtitle : scopeLabel);
  // Shuttle shading marks rail shutdowns; bus and CR gaps are just missing samples.
  const shuttling = isRail;

  if (!startDate || !endDate) {
    return <p>Select a date range to load graphs.</p>;
  }

  const stats = fleetMetrics.data
    ? getFleetStats(fleetMetrics.data, metrics.share, metrics.age, fleetTypes)
    : null;
  const percent = (value: number | undefined) =>
    value !== undefined && Number.isFinite(value) ? `${Math.round(value)}%` : '—';
  // Shares are 0-100, so a percentage-point delta is the raw difference.
  const shareDelta = (delta: number | undefined) => {
    if (delta === undefined || !Number.isFinite(delta)) return undefined;
    const sentiment: StatSentiment = Math.abs(delta) < 0.5 ? 'flat' : delta > 0 ? 'good' : 'bad';
    return { label: `${delta > 0 ? '+' : ''}${Math.round(delta)}pp`, sentiment };
  };
  // Younger is better, so a falling average age reads as good.
  const ageDelta = (delta: number) => {
    if (!Number.isFinite(delta)) return undefined;
    const sentiment: StatSentiment = Math.abs(delta) < 0.1 ? 'flat' : delta < 0 ? 'good' : 'bad';
    const word = sentiment === 'flat' ? 'flat' : sentiment === 'good' ? 'newer' : 'older';
    return { label: `${delta > 0 ? '+' : ''}${delta.toFixed(1)} yrs · ${word}`, sentiment };
  };
  const shareStat = stats?.share ?? stats?.newestType;
  const shareLabel = metrics.share
    ? metrics.share.axisLabel
    : `Trips by ${stats?.newestType?.type.label ?? 'newest'} cab cars`;
  const mostCommonLabel = isBus
    ? 'Most common propulsion'
    : isCommuterRail
      ? 'Most common cab car'
      : 'Most common car type';

  return (
    <PageWrapper pageTitle={'Fleet'}>
      <ChartPageDiv>
        {!isRail && selectedRoute && <div className="flex justify-end">{scopeControl}</div>}
        {stats && Number.isFinite(stats.age.value) && (
          <StatCardGrid>
            {shareStat && (
              <StatCard
                label={shareLabel}
                value={percent(shareStat.value)}
                delta={shareDelta(shareStat.delta)}
              />
            )}
            <StatCard
              label={metrics.age.title}
              value={stats.age.value.toFixed(1)}
              unit="years"
              delta={ageDelta(stats.age.delta)}
            />
            {stats.mostCommon && (
              <StatCard
                label={mostCommonLabel}
                value={stats.mostCommon.type.label}
                unit={`${percent(stats.mostCommon.value)} of ${isRail ? 'cars' : 'trips'}`}
              />
            )}
          </StatCardGrid>
        )}
        {metrics.share && (
          <Widget
            title={metrics.share.title}
            subtitle={subtitle('Share of trips across the line')}
            ready={[fleetMetrics]}
          >
            <FleetShareGraphWrapper
              data={fleetMetrics.data!}
              metric={metrics.share}
              showShuttling={shuttling}
              config={config}
              startDate={startDate}
              endDate={endDate}
            />
          </Widget>
        )}
        <Widget
          title={metrics.age.title}
          subtitle={subtitle('Average across the line')}
          ready={[fleetMetrics]}
        >
          <FleetAgeGraphWrapper
            data={fleetMetrics.data!}
            metric={metrics.age}
            showShuttling={shuttling}
            config={config}
            startDate={startDate}
            endDate={endDate}
          />
        </Widget>
        {fleetTypes && (
          <Widget
            title={metrics.mixTitle}
            subtitle={isRail ? metrics.mixSubtitle : `${metrics.mixSubtitle} · ${scopeLabel}`}
            ready={[fleetMetrics]}
          >
            <FleetMixGraphWrapper
              data={fleetMetrics.data!}
              types={fleetTypes}
              showShuttling={shuttling}
              config={config}
              startDate={startDate}
              endDate={endDate}
            />
          </Widget>
        )}
        <p className="text-sm text-muted-foreground">
          {isBus &&
            'Based on the buses seen at one stop per direction on each route, so expect some day-to-day noise. '}
          {isCommuterRail &&
            "The MBTA's feed identifies only the cab car at one end of each train, not the locomotive or the other coaches, so these figures describe cab cars. Based on one stop per direction on each line. "}
          {isRail &&
            'Based on a representative sample of trips per day, not a full census of the line, so expect some day-to-day noise.'}
        </p>
      </ChartPageDiv>
    </PageWrapper>
  );
}
