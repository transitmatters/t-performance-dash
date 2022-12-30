import React from 'react';

import { BenchmarkFieldKeys, MetricFieldKeys, PointFieldKeys } from '../../../src/charts/types';
import { stopIdsForStations } from '../../../utils/stations';
import { useCustomQueries } from '../../../api/datadashboard';
import { Station } from '../../../types/stations';
import { SingleDayAPIKeys } from '../../../types/api';
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
      [SingleDayAPIKeys.fromStop]: fromStopIds,
      [SingleDayAPIKeys.toStop]: toStopIds,
      [SingleDayAPIKeys.stop]: fromStopIds,
      [SingleDayAPIKeys.date]: startDate,
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
<<<<<<< HEAD
          data={headways.data || []}
          date={startDate}
          metricField={MetricFieldKeys.headWayTimeSec}
          pointField={PointFieldKeys.currentDepDt}
          benchmarkField={BenchmarkFieldKeys.benchmarkHeadwayTimeSec}
          isLoading={headways.isLoading}
          location={'todo'}
=======
          data={headwaysRequest.data || []}
          date={date}
          metricField={MetricFieldKeys.headWayTimeSec}
          pointField={PointFieldKeys.currentDepDt}
          benchmarkField={BenchmarkFieldKeys.benchmarkHeadwayTimeSec}
          isLoading={headwaysRequest.isLoading}
          location={location}
>>>>>>> v4-design-work
          fname={'todo'}
        />
      </div>
      <div className={'charts main-column'}>
        <SingleDayLineChart
          chartId={'dwells'}
          title={'Time spent at station (dwells)'}
<<<<<<< HEAD
          data={dwells.data || []}
          date={startDate}
          metricField={MetricFieldKeys.dwellTimeSec}
          pointField={PointFieldKeys.arrDt}
          isLoading={dwells.isLoading}
          location={'todo'}
=======
          data={dwellsRequest.data || []}
          date={date}
          metricField={MetricFieldKeys.dwellTimeSec}
          pointField={PointFieldKeys.arrDt}
          isLoading={dwellsRequest.isLoading}
          location={location}
>>>>>>> v4-design-work
          fname={'todo'}
        />
      </div>
    </div>
  );
};
