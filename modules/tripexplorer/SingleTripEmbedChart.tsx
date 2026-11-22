import { useSingleDayTripMetrics } from '../../common/api/hooks/tripExplorer';
import { EmbedMessage } from '../../common/components/embed/EmbedMessage';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import type { TripEmbedChart } from '../../common/constants/staticRoutes';
import { QueryNameKeys } from '../../common/types/api';
import type { RouteType } from '../../common/types/api';
import type { Station } from '../../common/types/stations';
import { stopIdsForStations } from '../../common/utils/stations';
import { DwellsSingleChart } from '../dwells/charts/DwellsSingleChart';
import { HeadwaysHistogram } from '../headways/charts/HeadwaysHistogram';
import { HeadwaysSingleChart } from '../headways/charts/HeadwaysSingleChart';
import { TravelTimesSingleChart } from '../traveltimes/charts/TravelTimesSingleChart';

const CHART_QUERIES: Record<TripEmbedChart<'single'>, QueryNameKeys> = {
  traveltimes: QueryNameKeys.traveltimes,
  headways: QueryNameKeys.headways,
  dwells: QueryNameKeys.dwells,
  'headway-distribution': QueryNameKeys.headways,
};

interface SingleTripEmbedChartProps {
  chart: TripEmbedChart<'single'>;
  routeType: RouteType;
  fromStation: Station;
  toStation: Station;
  date: string;
}

export const SingleTripEmbedChart = ({
  chart,
  routeType,
  fromStation,
  toStation,
  date,
}: SingleTripEmbedChartProps) => {
  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);
  const queryName = CHART_QUERIES[chart];
  const result = useSingleDayTripMetrics({
    routeType,
    params: { stop: fromStopIds, from_stop: fromStopIds, to_stop: toStopIds, date },
    only: [queryName],
  })[queryName];

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
