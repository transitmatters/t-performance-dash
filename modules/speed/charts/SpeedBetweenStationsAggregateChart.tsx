import React, { useMemo } from 'react';
import { AggregateLineChart } from '../../../common/components/charts/AggregateLineChart';
import { CHART_COLORS } from '../../../common/constants/colors';
import type { AggregateDataResponse, TravelTimesUnit } from '../../../common/types/charts';
import { PointFieldKeys } from '../../../common/types/charts';
import type { Station } from '../../../common/types/stations';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { getLocationDetails } from '../../../common/utils/stations';
import { convertToAggregateStationSpeedDataset } from '../../landing/utils';

interface SpeedBetweenStationsAggregateChartProps {
  traveltimes: AggregateDataResponse;
  toStation: Station;
  fromStation: Station;
  timeUnit?: TravelTimesUnit;
  peakTime?: boolean;
}

export const SpeedBetweenStationsAggregateChart: React.FC<
  SpeedBetweenStationsAggregateChartProps
> = ({ traveltimes, toStation, fromStation, timeUnit, peakTime = true }) => {
  const {
    query: { startDate, endDate },
  } = useDelimitatedRoute();

  const chart = useMemo(() => {
    const timeUnitByDate = timeUnit === 'by_date';

    const traveltimesData = timeUnitByDate
      ? traveltimes.by_date.filter((datapoint) => datapoint.peak === 'all')
      : traveltimes.by_time.filter((datapoint) => datapoint.is_peak_day === peakTime);

    return (
      <AggregateLineChart
        chartId={`speed_between_stations_agg_${timeUnitByDate ? 'by_date' : 'by_time'}`}
        data={convertToAggregateStationSpeedDataset(
          fromStation.station,
          toStation.station,
          traveltimesData
        )}
        // This is service date when agg by date. dep_time_from_epoch when agg by hour
        pointField={timeUnitByDate ? PointFieldKeys.serviceDate : PointFieldKeys.depTimeFromEpoch}
        timeUnit={timeUnitByDate ? 'day' : 'hour'}
        byTime={!timeUnitByDate}
        timeFormat={timeUnitByDate ? 'MMM d yyyy' : 'h:mm aaaa'}
        seriesName={'Median Speed'}
        startDate={startDate}
        endDate={endDate}
        fillColor={timeUnitByDate ? CHART_COLORS.FILL : CHART_COLORS.FILL_HOURLY}
        location={getLocationDetails(fromStation, toStation)}
        includeBothStopsForLocation={true}
        fname="speeds"
        yUnit="MPH"
      />
    );
  }, [timeUnit, traveltimes, startDate, endDate, fromStation, toStation, peakTime]);

  return chart;
};
