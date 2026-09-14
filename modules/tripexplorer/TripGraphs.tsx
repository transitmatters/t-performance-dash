import React from 'react';
import type { Station } from '../../common/types/stations';
import { useDelimitatedRoute } from '../../common/utils/router';
import { stopIdsForStations } from '../../common/utils/stations';
import type { AggregateAPIOptions, SingleDayAPIOptions } from '../../common/types/api';
import { AggregateAPIParams, SingleDayAPIParams } from '../../common/types/api';
import { BusTripGraphs } from './BusTripGraphs';
import { SubwayTripGraphs } from './SubwayTripGraphs';
import { CommuterRailTripGraphs } from './CommuterRailTripGraphs';
import { FerryTripGraphs } from './FerryTripGraphs';
import { TripSetupNotice } from './TripSetupNotice';

interface TripGraphsProps {
  fromStation: Station;
  toStation: Station;
}

export const TripGraphs: React.FC<TripGraphsProps> = ({ fromStation, toStation }) => {
  const {
    query: { startDate, endDate, date },
    tab,
    line,
    page,
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
  if (!enabled) {
    // Without this the queries below stay permanently pending: React Query does not fetch a
    // disabled query, so `data` is undefined and `isError` is false, and every wrapper's
    // placeholder renders a spinner that never resolves.
    if (!(fromStopIds && toStopIds)) return <TripSetupNotice missing="stations" />;
    return <TripSetupNotice missing={page === 'multiTrips' ? 'dateRange' : 'date'} />;
  }

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
  if (tab === 'Ferry')
    return (
      <FerryTripGraphs
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
