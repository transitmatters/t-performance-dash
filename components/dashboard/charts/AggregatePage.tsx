import React from 'react';
import { useCustomQueries } from '../../../api/datadashboard';

import { PointFieldKeys } from '../../../src/charts/types';
import { AggregateAPIKeys } from '../../../types/api';
import { DateOption } from '../../../types/inputs';
import { Station } from '../../../types/stations';
import { CHART_COLORS } from '../../../utils/constants';
import { stopIdsForStations } from '../../../utils/stations';
import { AggregateLineChart } from './AggregateLineChart';

interface AggregatePageProps {
  configuration: {
    fromStation: Station;
    toStation: Station;
    dateSelection: DateOption;
  };
}
/*
TODOS: 
 timeFormat is not set up to display week day correctly
 isLoading field
 location field
 Toggle for peak data only
 bus_mode
 Catch error when start date > end date.
*/

export const AggregatePage: React.FC<AggregatePageProps> = ({ configuration }) => {
  const { fromStation, toStation, dateSelection } = configuration;
  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);
  const { startDate, endDate } = dateSelection;

  const { traveltimes, headways, dwells } = useCustomQueries(
    {
      [AggregateAPIKeys.fromStop]: fromStopIds,
      [AggregateAPIKeys.toStop]: toStopIds,
      [AggregateAPIKeys.stop]: fromStopIds,
      [AggregateAPIKeys.startDate]: startDate ?? '',
      [AggregateAPIKeys.endDate]: endDate ?? '',
    },
    true
  );

  return (
    <div>
      <div className={'charts main-column'}>
        <AggregateLineChart
          chartId={'travel_times_agg'}
          title={'Travel times'}
          // TODO: fix this. Same issue with aggregate bvs. traveltime points...
          data={traveltimes?.data?.by_date?.filter((datapoint) => datapoint.peak === 'all') || []}
          // This is service date when agg by date. dep_time_from_epoch when agg by hour. Can probably remove this prop.
          pointField={PointFieldKeys.serviceDate}
          timeUnit={'day'}
          timeFormat={'MMM d yyyy'}
          seriesName="Median travel time"
          startDate={startDate}
          endDate={endDate}
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
          data={headways?.data?.by_date || []}
          pointField={PointFieldKeys.serviceDate}
          timeUnit={'day'}
          timeFormat={'MMM d yyyy'}
          seriesName="Median headway"
          startDate={startDate}
          endDate={endDate}
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
            data={dwells?.data?.by_date || []}
            pointField={PointFieldKeys.serviceDate}
            timeUnit={'day'}
            timeFormat={'MMM d yyyy'}
            seriesName="Median dwell time"
            startDate={startDate}
            endDate={endDate}
            fillColor={CHART_COLORS.FILL}
            location={'todo'}
            isLoading={false}
            fname="dwells"
          />
        </div>
      }
      <div className={'charts main-column'}>
        <AggregateLineChart
          chartId={'travel_times_agg_hour'}
          title={'Travel times by hour'}
          data={traveltimes?.data?.by_time?.filter((data) => data.is_peak_day) || []} // TODO: Add toggle for peak day.
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
