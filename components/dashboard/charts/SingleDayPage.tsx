import React from 'react';

import { BenchmarkFieldKeys, MetricFieldKeys, PointFieldKeys } from '../../../src/charts/types';
import { stopIdsForStations } from '../../../utils/stations';
import { useCustomQueries } from '../../../api/datadashboard';
import { Station } from '../../../types/stations';
import { SingleDayAPIParams } from '../../../types/api';
import { SingleDayLineChart } from './SingleDayLineChart';

interface SingleDayPageProps {
  fromStation: Station;
  toStation: Station;
  startDate: string;
}

export const SingleDayPage: React.FC<SingleDayPageProps> = ({
  fromStation,
  toStation,
  startDate,
}) => {
  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);

  const { traveltimes, headways, dwells } = useCustomQueries(
    {
      [SingleDayAPIParams.fromStop]: fromStopIds,
      [SingleDayAPIParams.toStop]: toStopIds,
      [SingleDayAPIParams.stop]: fromStopIds,
      [SingleDayAPIParams.date]: startDate,
    },
    false
  );

  return (
    <div>
      <div className={'charts main-column'}>
        <SingleDayLineChart
          chartId={'traveltimes'}
          title={'Travel Times'}
          data={traveltimes.data || []}
          date={startDate}
          metricField={MetricFieldKeys.travelTimeSec}
          pointField={PointFieldKeys.depDt}
          benchmarkField={BenchmarkFieldKeys.benchmarkTravelTimeSec}
          isLoading={traveltimes.isLoading}
          bothStops={true}
          location={'todo'}
          fname={'todo'}
        />
      </div>

      <div className={'charts main-column'}>
        <SingleDayLineChart
          chartId={'headways'}
          title={'Time between trains (headways)'}
          data={headways.data || []}
          date={startDate}
          metricField={MetricFieldKeys.headWayTimeSec}
          pointField={PointFieldKeys.currentDepDt}
          benchmarkField={BenchmarkFieldKeys.benchmarkHeadwayTimeSec}
          isLoading={headways.isLoading}
          location={'todo'}
          fname={'todo'}
        />
      </div>
      <div className={'charts main-column'}>
        <SingleDayLineChart
          chartId={'dwells'}
          title={'Time spent at station (dwells)'}
          data={dwells.data || []}
          date={startDate}
          metricField={MetricFieldKeys.dwellTimeSec}
          pointField={PointFieldKeys.arrDt}
          isLoading={dwells.isLoading}
          location={'todo'}
          fname={'todo'}
        />
      </div>
    </div>
  );
};
