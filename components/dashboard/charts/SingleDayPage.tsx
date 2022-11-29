import React from 'react';

import { BenchmarkFieldKeys, MetricFieldKeys, PointFieldKeys } from '../../../src/charts/types';
import { stopIdsForStations } from '../../../utils/stations';
import { useCustomQueries } from '../../../api/datadashboard';
import { Station } from '../../../types/stations';
import { SingleDayAPIKeys } from '../../../types/api';
import { DateOption } from '../../../types/inputs';
import { SingleDayLineChart } from './SingleDayLineChart';

interface SingleDayPageProps {
  configuration: {
    fromStation: Station;
    toStation: Station;
    dateSelection: DateOption;
  };
}

export const SingleDayPage: React.FC<SingleDayPageProps> = ({ configuration }) => {
  const { fromStation, toStation, dateSelection } = configuration;
  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);
  const date = dateSelection.startDate ?? '';

  const { traveltimes, headways, dwells } = useCustomQueries(
    {
      [SingleDayAPIKeys.fromStop]: fromStopIds,
      [SingleDayAPIKeys.toStop]: toStopIds,
      [SingleDayAPIKeys.stop]: fromStopIds,
      [SingleDayAPIKeys.date]: date,
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
          date={date}
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
          date={date}
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
          date={date}
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
