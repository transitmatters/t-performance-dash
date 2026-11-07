import { useTripExplorerQueries } from '../../common/api/datadashboard';
import { EmbedMessage } from '../../common/components/embed/EmbedMessage';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import type { TripEmbedChart } from '../../common/constants/staticRoutes';
import { QueryNameKeys, SingleDayAPIParams } from '../../common/types/api';
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
  const result = useTripExplorerQueries(
    routeType,
    {
      [SingleDayAPIParams.stop]: fromStopIds,
      [SingleDayAPIParams.fromStop]: fromStopIds,
      [SingleDayAPIParams.toStop]: toStopIds,
      [SingleDayAPIParams.date]: date,
    },
    false,
    Boolean(fromStopIds && toStopIds && date),
    [queryName]
  )[queryName];

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
