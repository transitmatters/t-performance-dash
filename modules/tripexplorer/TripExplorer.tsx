import React, { useState } from 'react';
import { StationSelectorWidget } from '../../common/components/widgets/StationSelectorWidget';
import { useDelimitatedRoute } from '../../common/utils/router';
import { optionsStation } from '../../common/utils/stations';
import { LayoutType } from '../../common/layouts/layoutTypes';
import { TripGraphs } from './TripGraphs';

export const TripExplorer = () => {
  const { lineShort } = useDelimitatedRoute();
  const stations = optionsStation(lineShort);

  const [toStation, setToStation] = useState(stations?.[stations.length - 3]);
  const [fromStation, setFromStation] = useState(stations?.[3]);

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
    </div>
  );
};

TripExplorer.Layout = LayoutType.Trips;
