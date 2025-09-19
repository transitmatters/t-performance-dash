import { faArrowRight, faRightLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React from 'react';
import { Button } from '../inputs/Button';
import { StationSelector } from '../inputs/StationSelector';
import { useDelimitatedRoute, useUpdateQuery } from '../../utils/router';
import {
  getParentStationForStopId,
  getStationForInvalidFromSelection,
  optionsStation,
  stopIdsForStations,
  findValidDefaultStations,
  findNextValidStation,
} from '../../utils/stations';
import type { BusRoute, CommuterRailRoute, Line, FerryRoute } from '../../types/lines';
import { LINE_OBJECTS } from '../../constants/lines';
import type { Station } from '../../types/stations';

interface StationSelectorWidgetProps {
  line: Line;
  busRoute: BusRoute | undefined;
  crRoute: CommuterRailRoute | undefined;
  ferryRoute: FerryRoute | undefined;
}

export const StationSelectorWidget: React.FC<StationSelectorWidgetProps> = ({
  line,
  busRoute,
  crRoute,
  ferryRoute,
}) => {
  const updateQueryParams = useUpdateQuery();
  const lineShort = LINE_OBJECTS[line].short;
  const {
    query: { from, to },
  } = useDelimitatedRoute();

  const stations = optionsStation(lineShort, busRoute, crRoute, ferryRoute);
  const { defaultFrom, defaultTo } = findValidDefaultStations(stations);
  const toStation = to ? getParentStationForStopId(to, lineShort) : defaultTo;
  const fromStation = from ? getParentStationForStopId(from, lineShort) : defaultFrom;

  React.useEffect(() => {
    if (fromStation && toStation && fromStation.station === toStation.station) {
      const nextValidStation = findNextValidStation(fromStation, stations);
      if (nextValidStation) {
        const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, nextValidStation);
        updateQueryParams({ from: fromStopIds?.[0], to: toStopIds?.[0] });
      }
    } else {
      const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);
      updateQueryParams({ from: fromStopIds?.[0], to: toStopIds?.[0] });
    }
  }, [fromStation, toStation, updateQueryParams, stations]);

  const updateStations = (action: 'to' | 'from' | 'swap', newStation?: Station) => {
    switch (action) {
      case 'to':
        updateQueryParams(
          {
            to: stopIdsForStations(fromStation, newStation).toStopIds?.[0],
          },
          undefined,
          false
        );
        break;
      case 'from': {
        if (
          newStation &&
          newStation.branches &&
          !newStation?.branches?.some((branch) => toStation?.branches?.includes(branch))
        ) {
          // If `from` station is on a separate branch, set the `to` station to gov center for GL and Park for RL.
          const newToStation = getStationForInvalidFromSelection(line, busRoute);
          const stationIds = stopIdsForStations(newStation, newToStation);
          updateQueryParams(
            {
              from: stationIds?.fromStopIds?.[0],
              to: stationIds?.toStopIds?.[0],
            },
            undefined,
            false
          );
          break;
        }
        updateQueryParams(
          {
            from: stopIdsForStations(newStation, toStation).fromStopIds?.[0],
          },
          undefined,
          false
        );
        break;
      }
      case 'swap': {
        const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);
        updateQueryParams({ from: toStopIds?.[0], to: fromStopIds?.[0] }, undefined, false);
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
        'flex w-full flex-row items-center gap-1 overflow-hidden p-1 md:p-0 xl:w-auto'
      )}
    >
      <StationSelector
        type={'from'}
        fromStation={fromStation}
        toStation={toStation}
        setStation={(newStation) => updateStations('from', newStation)}
      />
      <div className="flex h-4 w-4 items-center justify-center">
        <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4 text-white" />
      </div>
      <StationSelector
        type={'to'}
        fromStation={fromStation}
        toStation={toStation}
        setStation={(newStation) => updateStations('to', newStation)}
      />
      <Button
        onClick={() => updateStations('swap')}
        title={'Swap Stations'}
        additionalClasses={'shrink-0 w-fit'}
      >
        <FontAwesomeIcon icon={faRightLeft} className={'h-4 w-4'} />
      </Button>
    </div>
  );
};
