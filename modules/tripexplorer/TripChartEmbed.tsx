import dayjs from 'dayjs';
import { useTripExplorerQueries } from '../../common/api/datadashboard';
import { EmbedFrame } from '../../common/components/embed/EmbedFrame';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { PRETTY_DATE_FORMAT } from '../../common/constants/dates';
import type { TripEmbedChart } from '../../common/constants/staticRoutes';
import { QueryNameKeys, SingleDayAPIParams } from '../../common/types/api';
import type { RouteType } from '../../common/types/api';
import type { Tab } from '../../common/types/router';
import { normalizeDateParams } from '../../common/utils/dateParams';
import { useDelimitatedRoute } from '../../common/utils/router';
import {
  getLocationDetails,
  getParentStationForStopId,
  stopIdsForStations,
} from '../../common/utils/stations';
import { DwellsSingleChart } from '../dwells/charts/DwellsSingleChart';
import { HeadwaysHistogram } from '../headways/charts/HeadwaysHistogram';
import { HeadwaysSingleChart } from '../headways/charts/HeadwaysSingleChart';
import { TravelTimesSingleChart } from '../traveltimes/charts/TravelTimesSingleChart';
import { getTripEmbedTitle, getTripPageUrl } from './embed';

const ROUTE_TYPES: Partial<Record<Tab, RouteType>> = {
  Subway: 'subway',
  Bus: 'bus',
  'Commuter Rail': 'cr',
  Ferry: 'ferry',
};

const CHART_QUERIES: Record<TripEmbedChart, QueryNameKeys> = {
  traveltimes: QueryNameKeys.traveltimes,
  headways: QueryNameKeys.headways,
  dwells: QueryNameKeys.dwells,
  'headway-distribution': QueryNameKeys.headways,
};

const EmbedMessage = ({ children }: { children: string }) => (
  <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
    {children}
  </p>
);

interface TripChartEmbedProps {
  chart: TripEmbedChart;
}

/** One single-day trip chart on its own, for iframing into articles. */
export const TripChartEmbed = ({ chart }: TripChartEmbedProps) => {
  const route = useDelimitatedRoute();
  const { tab, lineShort, query } = route;
  // Fills in a missing or out-of-range day without rewriting the URL, as the slow zone embed does.
  const date = (normalizeDateParams({ section: 'singleTrips', tab, page: 'singleTrips', search: query })
    ?.date ?? query.date) as string;

  const fromStation = query.from ? getParentStationForStopId(query.from, lineShort) : undefined;
  const toStation = query.to ? getParentStationForStopId(query.to, lineShort) : undefined;
  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);
  const queryName = CHART_QUERIES[chart];
  const queries = useTripExplorerQueries(
    ROUTE_TYPES[tab] ?? 'subway',
    {
      [SingleDayAPIParams.stop]: fromStopIds,
      [SingleDayAPIParams.fromStop]: fromStopIds,
      [SingleDayAPIParams.toStop]: toStopIds,
      [SingleDayAPIParams.date]: date,
    },
    false,
    Boolean(fromStopIds && toStopIds && date),
    [queryName]
  );
  const result = queries[queryName];

  const location = getLocationDetails(fromStation, toStation);
  const where =
    chart === 'traveltimes'
      ? `${location.from} to ${location.to}`
      : `${location.from}, ${location.direction}`;

  const renderChart = () => {
    if (!fromStation || !toStation)
      return <EmbedMessage>This embed is missing its stops.</EmbedMessage>;
    if (!result.data) return <ChartPlaceHolder query={result} />;
    if (result.data.length < 1)
      return <EmbedMessage>No data for this trip on this day.</EmbedMessage>;
    const props = { toStation, fromStation, date, fill: true };
    switch (chart) {
      case 'traveltimes':
        return <TravelTimesSingleChart traveltimes={result.data} {...props} />;
      case 'headways':
        return <HeadwaysSingleChart headways={result.data} {...props} />;
      case 'dwells':
        return <DwellsSingleChart dwells={result.data} {...props} />;
      case 'headway-distribution':
        return <HeadwaysHistogram headways={result.data} {...props} />;
    }
  };

  return (
    <EmbedFrame
      title={getTripEmbedTitle(chart, route)}
      subtitle={`${where} · ${dayjs(date).format(PRETTY_DATE_FORMAT)}`}
      href={getTripPageUrl({ ...route, query: { ...query, date } })}
    >
      {renderChart()}
    </EmbedFrame>
  );
};
