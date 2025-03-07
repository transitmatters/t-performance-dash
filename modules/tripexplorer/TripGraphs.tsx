import React from 'react';
import type { Station } from '../../common/types/stations';
import { useDelimitatedRoute } from '../../common/utils/router';
import { stopIdsForStations } from '../../common/utils/stations';
import type { AggregateAPIOptions, SingleDayAPIOptions } from '../../common/types/api';
import { AggregateAPIParams, SingleDayAPIParams } from '../../common/types/api';
import { BusTripGraphs } from './BusTripGraphs';
import { SubwayTripGraphs } from './SubwayTripGraphs';
import { CommuterRailTripGraphs } from './CommuterRailTripGraphs';

interface TripGraphsProps {
  fromStation: Station;
  toStation: Station;
}

export const TripGraphs: React.FC<TripGraphsProps> = ({ fromStation, toStation }) => {
  const {
    query: { startDate, endDate, date },
    tab,
    line,
  } = useDelimitatedRoute();

  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);
  const enabled = Boolean((date || startDate) && fromStopIds && toStopIds);
  const aggregate = Boolean(startDate && endDate);
  const parameters: SingleDayAPIOptions | AggregateAPIOptions = aggregate
    ? {
        [AggregateAPIParams.stop]: fromStopIds,
        [AggregateAPIParams.fromStop]: fromStopIds,
        [AggregateAPIParams.toStop]: toStopIds,
        [AggregateAPIParams.startDate]: startDate,
        [AggregateAPIParams.endDate]: endDate,
      }
    : {
        [SingleDayAPIParams.stop]: fromStopIds,
        [SingleDayAPIParams.fromStop]: fromStopIds,
        [SingleDayAPIParams.toStop]: toStopIds,
        [SingleDayAPIParams.date]: date,
      };
  if (tab === 'Bus')
    return (
      <BusTripGraphs
        fromStation={fromStation}
        toStation={toStation}
        parameters={parameters}
        aggregate={aggregate}
        enabled={enabled}
        line={line}
      />
    );
  if (tab === 'Commuter Rail')
    return (
      <CommuterRailTripGraphs
        fromStation={fromStation}
        toStation={toStation}
        parameters={parameters}
        aggregate={aggregate}
        enabled={enabled}
        line={line}
      />
    );
  return (
    <SubwayTripGraphs
      fromStation={fromStation}
      toStation={toStation}
      parameters={parameters}
      aggregate={aggregate}
      enabled={enabled}
      line={line}
    />
  );
};
