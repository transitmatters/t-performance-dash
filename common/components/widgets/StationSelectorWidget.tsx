import { faArrowRight, faRightLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React from 'react';
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
import type { Station } from '../../types/stations';

interface StationSelectorWidgetProps {
  line: Line;
  busRoute: BusRoute | undefined;
}

export const StationSelectorWidget: React.FC<StationSelectorWidgetProps> = ({ line, busRoute }) => {
  const updateQueryParams = useUpdateQuery();
  const lineShort = LINE_OBJECTS[line].short;
  const {
    query: { from, to },
  } = useDelimitatedRoute();

  const stations = optionsStation(lineShort, busRoute);
  const toStation = to ? getParentStationForStopId(to) : stations?.[stations.length - 2];
  const fromStation = from ? getParentStationForStopId(from) : stations?.[1];

  React.useEffect(() => {
    const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);
    updateQueryParams({ from: fromStopIds?.[0], to: toStopIds?.[0] });
  }, [fromStation, toStation, updateQueryParams]);

  const updateStations = (action: 'to' | 'from' | 'swap', stationId?: Station) => {
    switch (action) {
      case 'to':
        updateQueryParams({
          to: stopIdsForStations(fromStation, stationId).toStopIds?.[0],
        });
        break;
      case 'from':
        updateQueryParams({
          from: stopIdsForStations(stationId, toStation).fromStopIds?.[0],
        });
        break;
      case 'swap': {
        const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);
        updateQueryParams({ from: toStopIds?.[0], to: fromStopIds?.[0] });
        break;
      }
    }
  };

  if (!fromStation || !toStation) {
    return null;
  }
  return (
    <div
      className={classNames(
        'relative flex w-full flex-row items-center gap-1 p-2 md:flex-col md:p-0 lg:flex-row'
      )}
    >
      <div className="flex flex-row items-center gap-1 overflow-hidden md:w-[238px] md:overflow-visible lg:w-fit">
        <StationSelector
          type={'from'}
          fromStation={fromStation}
          toStation={toStation}
          setStation={(stationId) => updateStations('from', stationId)}
        />
        <div className="flex h-4 w-4 items-center justify-center">
          <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4" />
        </div>
      </div>
      <div className="flex flex-row items-center gap-1 overflow-hidden md:w-[238px] md:overflow-visible lg:w-fit">
        <StationSelector
          type={'to'}
          fromStation={fromStation}
          toStation={toStation}
          setStation={(stationId) => updateStations('to', stationId)}
        />
        <Button onClick={() => updateStations('swap')} additionalClasses="shrink-0 w-fit">
          <FontAwesomeIcon icon={faRightLeft} className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
