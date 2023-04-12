import React, { useEffect, useState } from 'react';
import { useDelimitatedRoute } from '../../common/utils/router';
import { getParentStationForStopId, optionsStation } from '../../common/utils/stations';
import { TerminusNotice } from '../../common/components/notices/TerminusNotice';
import { StationSelectorWidget } from '../../common/components/widgets/StationSelectorWidget';
import { TripGraphs } from './TripGraphs';

export const TripExplorer = () => {
  const {
    lineShort,
    query: { to, from },
  } = useDelimitatedRoute();

  const stations = optionsStation(lineShort);
  const [toStation, setToStation] = useState(
    to ? getParentStationForStopId(to) : stations?.[stations.length - 2]
  );
  const [fromStation, setFromStation] = useState(
    from ? getParentStationForStopId(from) : stations?.[1]
  );

  useEffect(() => {
    if (!from) setFromStation(stations?.[3]);
    if (!to) setToStation(stations?.[stations.length - 3]);
  }, [lineShort, from, to, stations, setFromStation, setToStation]);

  if (!(fromStation && toStation)) {
    return null;
  }
  return (
    <div>
      <StationSelectorWidget
        fromStation={fromStation}
        toStation={toStation}
        setFromStation={setFromStation}
        setToStation={setToStation}
      />
      <TripGraphs fromStation={fromStation} toStation={toStation} />
      <TerminusNotice toStation={toStation} fromStation={fromStation} />
    </div>
  );
};
