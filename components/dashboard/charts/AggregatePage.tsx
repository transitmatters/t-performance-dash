import React from 'react';
import { useQueryAggregateData, useQueryTravelTimes } from '../../../api/datadashboard';

import { PointFieldKeys } from '../../../src/charts/types';
import { AggregateAPIKeys, QueryNameKeys } from '../../../types/api';
import { DateOption } from '../../../types/inputs';
import { Station } from '../../../types/stations';
import { CHART_COLORS } from '../../../utils/constants';
import { stopIdsForStations } from '../../../utils/stations';
import { AggregateLineChart } from './AggregateLineChart';

interface AggregatePageProps {
  configuration: {
    fromStation: Station;
    toStation: Station;
    dateSelection: DateOption | null;
  };
}
/*
TODOS: 
 timeFormat is not set up to display week day correctly
 isLoading field
 location field
 Toggle for peak data only
 bus_mode
*/

export const AggregatePage: React.FC<AggregatePageProps> = ({ configuration }) => {
  const { fromStation, toStation, dateSelection } = configuration;
  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);
  const startDate = dateSelection?.startDate;
  const endDate = dateSelection?.endDate;
  const queryIsReady = !!(fromStopIds && startDate && endDate);

  const traveltimesRequest = useQueryTravelTimes(
    {
      [AggregateAPIKeys.fromStop]: fromStopIds || [],
      [AggregateAPIKeys.toStop]: toStopIds || [],
      [AggregateAPIKeys.start_date]: dateSelection?.startDate || '',
      [AggregateAPIKeys.end_date]: dateSelection?.endDate || '',
    },
    QueryNameKeys.traveltimes,
    queryIsReady
  );
  const headwaysRequest = useQueryAggregateData(
    {
      [AggregateAPIKeys.stop]: fromStopIds || [],
      [AggregateAPIKeys.start_date]: dateSelection?.startDate || '',
      [AggregateAPIKeys.end_date]: dateSelection?.endDate || '',
    },
    QueryNameKeys.headways,
    queryIsReady
  );
  const dwellsRequest = useQueryAggregateData(
    {
      [AggregateAPIKeys.stop]: fromStopIds || [],
      [AggregateAPIKeys.start_date]: dateSelection?.startDate || '',
      [AggregateAPIKeys.end_date]: dateSelection?.endDate || '',
    },
    QueryNameKeys.dwells,
    queryIsReady
  );

  return (
    <div>
      <div className={'charts main-column'}>
        <AggregateLineChart
          chartId={'travel_times_agg'}
          title={'Travel times'}
          data={
            traveltimesRequest?.data?.by_date?.filter((datapoint) => datapoint.peak === 'all') || []
          }
          // This is service date when agg by date. dep_time_from_epoch when agg by hour. Can probably remove this prop.
          pointField={PointFieldKeys.serviceDate}
          timeUnit={'day'}
          timeFormat={'MMM d yyyy'}
          seriesName="Median travel time"
          startDate={dateSelection?.startDate}
          endDate={dateSelection?.endDate}
          fillColor={CHART_COLORS.FILL}
          location={'todo'}
          isLoading={false}
          bothStops={true}
          fname="traveltimes"
        />
      </div>
      <div className={'charts main-column'}>
        <AggregateLineChart
          chartId={'headways_agg'}
          title={'Time between trains (headways)'}
          data={headwaysRequest.data || []}
          pointField={PointFieldKeys.serviceDate}
          timeUnit={'day'}
          timeFormat={'MMM d yyyy'}
          seriesName="Median headway"
          startDate={dateSelection?.startDate}
          endDate={dateSelection?.endDate}
          fillColor={CHART_COLORS.FILL}
          location={'todo'}
          isLoading={false}
          fname="headways"
        />
      </div>
      {
        // TODO: Make this only appear when not on bus lines.
        // !bus_mode &&
        <div className={'charts main-column'}>
          <AggregateLineChart
            chartId={'dwells_agg'}
            title={'Time spent at stations (dwells)'}
            data={dwellsRequest.data || []}
            pointField={PointFieldKeys.serviceDate}
            timeUnit={'day'}
            timeFormat={'MMM d yyyy'}
            seriesName="Median dwell time"
            startDate={dateSelection?.startDate}
            endDate={dateSelection?.endDate}
            fillColor={CHART_COLORS.FILL}
            location={'todo'}
            isLoading={false}
            fname="dwells"
          />
        </div>
      }
      <div className={'charts main-column'}>
        <AggregateLineChart
          chartId={'dwells_agg'}
          title={'Travel times by hour'}
          data={traveltimesRequest?.data?.by_time?.filter((data) => data.is_peak_day) || []} // TODO: Add toggle for this.
          pointField={PointFieldKeys.depTimeFromEpoch}
          timeUnit={'hour'}
          timeFormat="hh:mm a"
          seriesName="Median travel time"
          startDate={dateSelection?.startDate}
          endDate={dateSelection?.endDate}
          fillColor={CHART_COLORS.FILL_HOURLY}
          location={'todo'}
          isLoading={false}
          bothStops={true}
          fname="traveltimesByHour"
        />
      </div>
    </div>
  );
};
