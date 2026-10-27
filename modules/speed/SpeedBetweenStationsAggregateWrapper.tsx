import type { ChunkedAggregateQueryResult } from '../../common/types/charts';
import type { Station } from '../../common/types/stations';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { ChartStack } from '../../common/components/charts/ChartStack';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { PartialDataNotice } from '../../common/components/notices/PartialDataNotice';
import { StatStrip } from '../../common/components/widgets/StatStrip';
import { getAggDataWidgets } from '../../common/utils/widgets';
import { convertToAggregateStationSpeedDataset } from '../landing/utils';
import { SpeedBetweenStationsAggregateChart } from './charts/SpeedBetweenStationsAggregateChart';

interface SpeedBetweenStationsAggregateWrapperProps {
  query: ChunkedAggregateQueryResult;
  toStation: Station;
  fromStation: Station;
}

export const SpeedBetweenStationsAggregateWrapper = ({
  query,
  toStation,
  fromStation,
}: SpeedBetweenStationsAggregateWrapperProps) => {
  const dataReady = !query.isError && query.data && toStation && fromStation && query.data;
  if (!dataReady) return <ChartPlaceHolder query={query} />;
  const traveltimesData = convertToAggregateStationSpeedDataset(
    fromStation.station,
    toStation.station,
    query.data.by_date.filter((datapoint) => datapoint.peak === 'all')
  );
  if (traveltimesData.length < 1) return <NoDataNotice shutdownScope="trip" />;
  const widgetObjects = getAggDataWidgets(traveltimesData, 'speeds');
  return (
    <ChartStack>
      <SpeedBetweenStationsAggregateChart
        traveltimes={query.data}
        toStation={toStation}
        fromStation={fromStation}
        timeUnit={'by_date'}
      />
      {!query.chunks?.pending && <StatStrip widgetObjects={widgetObjects} />}
      <PartialDataNotice query={query} />
    </ChartStack>
  );
};
