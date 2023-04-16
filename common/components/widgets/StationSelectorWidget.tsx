import { faArrowRight, faRightLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React, { useState } from 'react';
import { Button } from '../inputs/Button';
import { StationSelector } from '../inputs/StationSelector';
import { useDelimitatedRoute, useUpdateQuery } from '../../utils/router';
import {
  getParentStationForStopId,
  optionsStation,
  stopIdsForStations,
} from '../../utils/stations';
import type { BusRoute, Line } from '../../types/lines';
import { LINE_OBJECTS } from '../../constants/lines';

interface StationSelectorWidgetProps {
  line: Line;
  busRoute?: BusRoute;
}

export const StationSelectorWidget: React.FC<StationSelectorWidgetProps> = ({ line, busRoute }) => {
  const updateQueryParams = useUpdateQuery();
  const lineShort = LINE_OBJECTS[line].short;
  const {
    query: { from, to },
  } = useDelimitatedRoute();

  const stations = optionsStation(lineShort, busRoute);
  const [toStation, setToStation] = useState(
    to ? getParentStationForStopId(to) : stations?.[stations.length - 2]
  );
  const [fromStation, setFromStation] = useState(
    from ? getParentStationForStopId(from) : stations?.[1]
  );
  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);

  const swapStations = () => {
    const tempFromStation = fromStation;
    const tempToStation = toStation;
    setFromStation(tempToStation);
    setToStation(tempFromStation);
  };

  React.useEffect(() => {
    updateQueryParams({ from: fromStopIds?.[0], to: toStopIds?.[0] });
  }, [fromStation, fromStopIds, toStation, toStopIds, updateQueryParams]);

  if (!fromStation || !toStation) {
    return null;
  }

  return (
    <div className={classNames('relative flex w-full flex-row items-center gap-1 p-2 md:p-0')}>
      <StationSelector
        type={'from'}
        fromStation={fromStation}
        toStation={toStation}
        setStation={setFromStation}
      />
      <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4" />

      <StationSelector
        type={'to'}
        fromStation={fromStation}
        toStation={toStation}
        setStation={setToStation}
      />
      <Button onClick={swapStations} additionalClasses="shrink-0">
        <FontAwesomeIcon icon={faRightLeft} className="h-4 w-4" />
      </Button>
    </div>
  );
};
