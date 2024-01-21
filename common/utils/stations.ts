import type { BusRoute, CommuterRailRoute, Line, LineShort } from '../types/lines';
import { isLineMap, type Station } from '../types/stations';
import type { Location } from '../types/charts';
import type { Direction, Distance } from '../types/dataPoints';
import { stations, rtStations, busStations, crStations } from '../constants/stations';
import { station_distances } from '../constants/station_distances';

export const optionsForField = (
  type: 'from' | 'to',
  line: LineShort,
  fromStation: Station | null,
  busRoute?: BusRoute,
  crRoute?: CommuterRailRoute
) => {
  if (type === 'from') {
    return optionsStation(line, busRoute, crRoute);
  }
  if (type === 'to') {
    return optionsStation(line, busRoute, crRoute)?.filter((entry) => {
      if (fromStation && fromStation.branches && entry.branches) {
        return entry.branches.some((entryBranch) => fromStation.branches?.includes(entryBranch));
      }
      return true;
    });
  }
};

export const optionsStation = (
  line: LineShort,
  busRoute?: BusRoute,
  crRoute?: CommuterRailRoute
): Station[] | undefined => {
  if (!line || !stations[line]) {
    return undefined;
  }

  if (line === 'Bus') {
    if (!busRoute || !stations[line][busRoute]) {
      return undefined;
    }

    return stations[line][busRoute].stations.sort((a, b) => a.order - b.order);
  }

  if (line === 'Commuter Rail') {
    if (!crRoute || !stations[line][crRoute]) {
      return undefined;
    }

    return stations[line][crRoute].stations.sort((a, b) => a.order - b.order);
  }

  return stations[line].stations.sort((a, b) => a.order - b.order);
};

const createStationIndex = () => {
  const index: Record<string, Station> = {};
  Object.values({ ...rtStations, ...busStations, ...crStations }).forEach((line) => {
    line.stations.forEach((station) => {
      index[station.station] = station;
    });
  });
  return index;
};

const createParentStationIndex = () => {
  const index: Record<string, Station> = {};
  Object.values({ ...rtStations, ...busStations, ...crStations }).forEach((line) => {
    line.stations.forEach((station) => {
      const allStopIds = [...(station.stops['0'] || []), ...(station.stops['1'] || [])];
      allStopIds.forEach((stopId) => {
        index[stopId] = station;
      });
    });
  });
  return index;
};

const createStationDistanceIndex = () => {
  const index: Record<string, Distance> = {};

  for (const [key, value] of Object.entries(station_distances)) {
    index[key] = value as Distance;
  }

  return index;
};

const stationIndex = createStationIndex();
const parentStationIndex = createParentStationIndex();
const stationDistanceIndex = createStationDistanceIndex();

export const getStationById = (stationStopId: string) => {
  return stationIndex[stationStopId];
};

export const getParentStationForStopId = (stopId: string) => {
  return parentStationIndex[stopId];
};

export const getStationDistance = (fromStationId: string, toStationId: string) => {
  return stationDistanceIndex[fromStationId][toStationId];
};

export const getStationForInvalidFromSelection = (line: Line, busRoute?: BusRoute): Station => {
  if (line === 'line-green') return getParentStationForStopId('70202'); // Gov. Center
  if (line === 'line-red') return getParentStationForStopId('70076'); // Park St.
  if (line === 'line-bus') {
    if (busRoute === '17/19') return getParentStationForStopId('17-1-323');
    if (busRoute === '220/221/222') return getParentStationForStopId('222-1-32004');
    if (busRoute === '61/70/170') return getParentStationForStopId('70-0-88333');
    if (busRoute === '104/109') return getParentStationForStopId('104-1-5560');
  }
  throw new Error('There should be no other lines with invalid from station selections.');
};

export const stopIdsForStations = (from: Station | undefined, to: Station | undefined) => {
  if (to === undefined || from === undefined) {
    return { fromStopIds: undefined, toStopIds: undefined };
  }

  const isDirection1 = from.order < to.order;
  return {
    fromStopIds: isDirection1 ? from.stops['1'] : from.stops['0'],
    toStopIds: isDirection1 ? to.stops['1'] : to.stops['0'],
  };
};

const travelDirection = (from: Station, to: Station): Direction => {
  return from.order < to.order ? 'southbound' : 'northbound';
};

export const getLocationDetails = (
  from: Station | undefined,
  to: Station | undefined
): Location => {
  if (to === undefined || from === undefined) {
    return {
      to: to?.stop_name || 'Loading...',
      from: from?.stop_name || 'Loading...',
      direction: 'southbound',
    };
  }

  return {
    to: to.stop_name,
    from: from.stop_name,
    direction: travelDirection(from, to),
  };
};

export const getStationKeysFromStations = (line: LineShort): string[] => {
  const lineStations = stations[line].stations;
  if (isLineMap(lineStations)) {
    return lineStations.stations.map((station: Station) => station.station);
  } else {
    return lineStations.map((station: Station) => station.station);
  }
};
