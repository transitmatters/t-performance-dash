import { faArrowRight, faRightLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect } from 'react';
import { Button } from '../inputs/Button';
import { StationSelector } from '../inputs/StationSelector';
import { useDelimitatedRoute, useUpdateQuery } from '../../utils/router';
import {
  getStationInOptions,
  getStationForInvalidFromSelection,
  optionsStation,
  stopIdsForStations,
  findValidDefaultStations,
  findNextValidStation,
  stopNoun,
} from '../../utils/stations';
import type { BusRoute, CommuterRailRoute, Line, FerryRoute } from '../../types/lines';
import { LINE_OBJECTS } from '../../constants/lines';
import type { Station } from '../../types/stations';

export interface StationSelectorWidgetProps {
  line: Line;
  busRoute: BusRoute | undefined;
  crRoute: CommuterRailRoute | undefined;
  ferryRoute: FerryRoute | undefined;
}

/**
 * The trip's two ends, falling back to the route's defaults, and kept valid in the URL. Mounted
 * wherever the trip is shown, even with the picker hidden (the mobile controls sheet), so a
 * first visit always gets stations.
 */
export const useTripStations = ({
  line,
  busRoute,
  crRoute,
  ferryRoute,
}: StationSelectorWidgetProps) => {
  const updateQueryParams = useUpdateQuery();
  const lineShort = LINE_OBJECTS[line].short;
  const {
    query: { from, to },
  } = useDelimitatedRoute();

  const stations = optionsStation(lineShort, busRoute, crRoute, ferryRoute);
  const { defaultFrom, defaultTo } = findValidDefaultStations(stations);
  const toStation = getStationInOptions(to, stations) ?? defaultTo;
  const fromStation = getStationInOptions(from, stations) ?? defaultFrom;

  useEffect(() => {
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

  return { stations, fromStation, toStation, lineShort };
};

export const StationSelectorWidget = ({
  line,
  busRoute,
  crRoute,
  ferryRoute,
}: StationSelectorWidgetProps) => {
  const updateQueryParams = useUpdateQuery();
  const { stations, fromStation, toStation, lineShort } = useTripStations({
    line,
    busRoute,
    crRoute,
    ferryRoute,
  });

  const updateStations = (action: 'to' | 'from' | 'swap', newStation?: Station) => {
    switch (action) {
      case 'to':
        updateQueryParams(
          {
            to: stopIdsForStations(fromStation, newStation).toStopIds?.[0],
          },
          false
        );
        break;
      case 'from': {
        if (
          newStation &&
          newStation.branches &&
          !newStation?.branches?.some((branch) => toStation?.branches?.includes(branch))
        ) {
          // The new `from` is on a branch the current `to` isn't: end the trip where the branches meet.
          const newToStation = getStationForInvalidFromSelection(
            line,
            newStation,
            stations,
            ferryRoute
          );
          if (!newToStation) break;
          const stationIds = stopIdsForStations(newStation, newToStation);
          updateQueryParams(
            {
              from: stationIds?.fromStopIds?.[0],
              to: stationIds?.toStopIds?.[0],
            },
            false
          );
          break;
        }
        updateQueryParams(
          {
            from: stopIdsForStations(newStation, toStation).fromStopIds?.[0],
          },
          false
        );
        break;
      }
      case 'swap': {
        const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);
        updateQueryParams({ from: toStopIds?.[0], to: fromStopIds?.[0] }, false);
        break;
      }
    }
  };

  if (!fromStation || !toStation) {
    return null;
  }
  // Some stops are only served one way, so the reverse trip can have no stop to end at.
  const reversed = stopIdsForStations(toStation, fromStation);
  const canSwap = Boolean(reversed.fromStopIds?.length && reversed.toStopIds?.length);
  return (
    <div className="flex w-full min-w-0 flex-row items-center gap-1.5 md:w-auto">
      <StationSelector
        type={'from'}
        fromStation={fromStation}
        toStation={toStation}
        setStation={(newStation) => updateStations('from', newStation)}
      />
      <div className="flex h-4 w-4 shrink-0 items-center justify-center">
        <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4" aria-hidden />
        <span className="sr-only">to</span>
      </div>
      <StationSelector
        type={'to'}
        fromStation={fromStation}
        toStation={toStation}
        setStation={(newStation) => updateStations('to', newStation)}
      />
      <Button
        onClick={() => updateStations('swap')}
        disabled={!canSwap}
        title={
          canSwap
            ? `Swap ${stopNoun(lineShort)}s`
            : `No trips run from ${toStation.stop_name} to ${fromStation.stop_name}`
        }
        aria-label={`Swap direction: show ${toStation.stop_name} to ${fromStation.stop_name}`}
        additionalClasses={'shrink-0 w-fit disabled:cursor-not-allowed disabled:opacity-50'}
      >
        <FontAwesomeIcon icon={faRightLeft} className={'h-4 w-4'} aria-hidden />
      </Button>
    </div>
  );
};
