import React from 'react';

import { BenchmarkFieldKeys, MetricFieldKeys, PointFieldKeys } from '../../../src/charts/types';
import { stopIdsForStations } from '../../../utils/stations';
import { useQuerySingleDayData } from '../../../api/datadashboard';
import { Station } from '../../../types/stations';
import { QueryNameKeys, SingleDayAPIKeys } from '../../../types/api';
import { DateOption } from '../../../types/inputs';
import { SingleDayLineChart } from './SingleDayLineChart';

interface SingleDayPageProps {
  configuration: {
    fromStation: Station;
    toStation: Station;
    dateSelection: DateOption | null;
  };
}

export const SingleDayPage: React.FC<SingleDayPageProps> = ({ configuration }) => {
  const { fromStation, toStation, dateSelection } = configuration;
  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);
  const date = dateSelection?.startDate;
  const queryIsReady = !!(fromStopIds && date);

  const traveltimesRequest = useQuerySingleDayData(
    {
      [SingleDayAPIKeys.fromStop]: fromStopIds,
      [SingleDayAPIKeys.toStop]: toStopIds,
    },
    QueryNameKeys.traveltimes,
    queryIsReady,
    date
  );
  const headwaysRequest = useQuerySingleDayData(
    {
      [SingleDayAPIKeys.stop]: fromStopIds,
    },
    QueryNameKeys.headways,
    queryIsReady,
    date
  );
  const dwellsRequest = useQuerySingleDayData(
    {
      [SingleDayAPIKeys.stop]: fromStopIds,
    },
    QueryNameKeys.dwells,
    queryIsReady,
    date
  );

  if (!queryIsReady) {
    //TODO: Add something nice here when no charts are loaded.
    return <p> select values to load charts.</p>;
  }
  return (
    <div>
      <div className={'charts main-column'}>
        <SingleDayLineChart
          chartId={'traveltimes'}
          title={'Travel Times'}
          data={traveltimesRequest.data || []}
          date={date}
          metricField={MetricFieldKeys.travelTimeSec}
          pointField={PointFieldKeys.depDt}
          benchmarkField={BenchmarkFieldKeys.benchmarkTravelTimeSec}
          isLoading={traveltimesRequest.isLoading}
          bothStops={true}
          location={'todo'}
          fname={'todo'}
        />
      </div>

      <div className={'charts main-column'}>
        <SingleDayLineChart
          chartId={'headways'}
          title={'Time between trains (headways)'}
          data={headwaysRequest.data || []}
          date={date}
          metricField={MetricFieldKeys.headWayTimeSec}
          pointField={PointFieldKeys.currentDepDt}
          benchmarkField={BenchmarkFieldKeys.benchmarkHeadwayTimeSec}
          isLoading={headwaysRequest.isLoading}
          location={'todo'}
          fname={'todo'}
        />
      </div>
      <div className={'charts main-column'}>
        <SingleDayLineChart
          chartId={'dwells'}
          title={'Time spent at station (dwells)'}
          data={dwellsRequest.data || []}
          date={date}
          metricField={MetricFieldKeys.dwellTimeSec}
          pointField={PointFieldKeys.arrDt}
          isLoading={dwellsRequest.isLoading}
          location={'todo'}
          fname={'todo'}
        />
      </div>
    </div>
  );
};
