import type { BusRoute, CommuterRailRoute, Line, LineShort, FerryRoute } from '../types/lines';
import { type Station } from '../types/stations';
import type { Location } from '../types/charts';
import type { Direction, Distance } from '../types/dataPoints';
import {
  stations,
  rtStations,
  busStations,
  crStations,
  ferryStations,
} from '../constants/stations';
import { station_distances } from '../constants/station_distances';
import type { Tab } from '../types/router';

// Type guards for line types
const isBusLine = (line: LineShort): line is 'Bus' => line === 'Bus';
const isCommuterRailLine = (line: LineShort): line is 'Commuter Rail' => line === 'Commuter Rail';
const isFerryLine = (line: LineShort): line is 'Ferry' => line === 'Ferry';
const isRapidTransitLine = (
  line: LineShort
): line is Exclude<LineShort, 'Bus' | 'Commuter Rail' | 'Ferry'> =>
  !isBusLine(line) && !isCommuterRailLine(line) && !isFerryLine(line);

// Helper function to safely get stations for a line
const getStationsForLine = (
  line: LineShort,
  route?: BusRoute | CommuterRailRoute
): Station[] | undefined => {
  if (isBusLine(line) && route) {
    return stations.Bus[route]?.stations;
  }

  if (isCommuterRailLine(line) && route) {
    return stations['Commuter Rail'][route]?.stations;
  }

  // For rapid transit lines (Red, Orange, Green, Blue, Mattapan)
  if (isRapidTransitLine(line)) {
    return rtStations[line]?.stations;
  }

  return undefined;
};

export const optionsForField = (
  type: 'from' | 'to',
  line: LineShort,
  fromStation: Station | null,
  busRoute?: BusRoute,
  crRoute?: CommuterRailRoute,
  ferryRoute?: FerryRoute
) => {
  if (type === 'from') {
    return optionsStation(line, busRoute, crRoute, ferryRoute);
  }
  if (type === 'to') {
    return optionsStation(line, busRoute, crRoute, ferryRoute)?.filter((entry) => {
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
  crRoute?: CommuterRailRoute,
  ferryRoute?: FerryRoute
): Station[] | undefined => {
  if (!line || !stations[line]) {
    return undefined;
  }

  if (isBusLine(line)) {
    if (!busRoute || !stations[line][busRoute]) {
      return undefined;
    }

    return stations[line][busRoute].stations.sort((a, b) => a.order - b.order);
  }

  if (isCommuterRailLine(line)) {
    if (!crRoute || !stations[line][crRoute]) {
      return undefined;
    }

    return stations[line][crRoute].stations.sort((a, b) => a.order - b.order);
  }

  // Fixed: Access rtStations directly for rapid transit lines
  if (isRapidTransitLine(line)) {
    return rtStations[line].stations.sort((a, b) => a.order - b.order);
  }

  if (isFerryLine(line)) {
    if (!ferryRoute || !ferryStations[ferryRoute]) {
      return undefined;
    }

    return ferryStations[ferryRoute].stations.sort((a, b) => a.order - b.order);
  }

  return undefined;
};

const createStationIndex = () => {
  const index: Record<string, Station> = {};
  Object.values({ ...rtStations, ...busStations, ...crStations, ...ferryStations }).forEach(
    (line) => {
      line.stations.forEach((station) => {
        index[station.station] = station;
      });
    }
  );
  return index;
};

const createParentStationIndex = () => {
  const index: Record<string, Station> = {};
  Object.values({ ...rtStations, ...busStations, ...crStations, ...ferryStations }).forEach(
    (line) => {
      line.stations.forEach((station) => {
        const allStopIds = [...(station.stops['0'] || []), ...(station.stops['1'] || [])];
        allStopIds.forEach((stopId) => {
          index[stopId] = station;
        });
      });
    }
  );
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

/** Given a stop id, return the full station it belongs to
 * We need the line to get the correct station when lines share ids (Ex: Ashmont)
 */
export const getParentStationForStopId = (stopId: string, line?: LineShort) => {
  if (line && isRapidTransitLine(line)) {
    const stationsData = getStationsForLine(line);
    const station = stationsData?.find(
      (station: Station) =>
        station.stops['0'].includes(stopId) || station.stops['1'].includes(stopId)
    );
    if (station) {
      return station;
    }
  }

  return parentStationIndex[stopId];
};

export const getStationDistance = (fromStationId: string, toStationId: string) => {
  return stationDistanceIndex[fromStationId][toStationId];
};

export const getStationForInvalidFromSelection = (
  line: Line,
  busRoute?: BusRoute,
  ferryRoute?: FerryRoute
): Station => {
  if (line === 'line-green') return getParentStationForStopId('70202'); // Gov. Center
  if (line === 'line-red') return getParentStationForStopId('70076'); // Park St.
  if (line === 'line-bus') {
    if (busRoute === '17/19') return getParentStationForStopId('17-1-323');
    if (busRoute === '220/221/222') return getParentStationForStopId('222-1-32004');
    if (busRoute === '61/70/170') return getParentStationForStopId('70-0-88333');
    if (busRoute === '104/109') return getParentStationForStopId('104-1-5560');
    if (busRoute === 'SL1/SL2/SL3/SLW') return getParentStationForStopId('SL1-1-74617'); // South Station (Silver Line)
    if (busRoute === 'SL4/SL5') return getParentStationForStopId('SL4-1-64'); // Nubian Station
  }
  if (line === 'line-ferry' && ferryRoute) {
    // Return the first ferry station for the route
    const { stations } = ferryStations[ferryRoute];
    return stations[0];
  }
  throw new Error('There should be no other lines with invalid from station selections.');
};

export const stopIdsForStations = (from: Station | undefined, to: Station | undefined) => {
  if (to === undefined || from === undefined) {
    return { fromStopIds: undefined, toStopIds: undefined };
  }

  const isDirection1 = from.order < to.order;
  const directionKey = isDirection1 ? '1' : '0';
  return {
    fromStopIds: from.stops[directionKey],
    toStopIds: to.stops[directionKey],
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

export const getStationKeysFromStations = (
  line: LineShort,
  route?: BusRoute | CommuterRailRoute
): string[] => {
  const stationsData = getStationsForLine(line, route);
  if (!stationsData) {
    return [];
  }

  return stationsData.map((station: Station) => station.station);
};

export const findValidDefaultStations = (stations: Station[] | undefined) => {
  if (!stations?.length) return { defaultFrom: undefined, defaultTo: undefined };

  if (stations.length === 2) {
    const defaultFrom = stations[0];
    const defaultTo = stations[1];

    //if defaultFrom && defaultTo are not null and defaultFrom is not equal to defaultTo
    if (defaultFrom && defaultTo && defaultFrom.station !== defaultTo.station) {
      return { defaultFrom, defaultTo };
    }
  }

  for (const dir of ['1', '0']) {
    const validStations = stations.filter((s) => s.stops[dir]?.length > 0);
    if (validStations.length >= 2) {
      const [defaultFrom, defaultTo] = validStations.slice(1, 3);
      if (defaultFrom && defaultTo && defaultFrom.station !== defaultTo.station) {
        return { defaultFrom, defaultTo };
      }
    }
  }
  return { defaultFrom: undefined, defaultTo: undefined };
};

export const findNextValidStation = (
  station: Station,
  stations: Station[] | undefined
): Station | undefined =>
  stations?.find(
    (s) =>
      s.order > station.order &&
      s.station !== station.station &&
      s.stops[station.stops['1']?.length ? '1' : '0']?.length > 0
  );

export const getMinMaxDatesForRoute = (
  tab: Tab,
  route?: BusRoute | CommuterRailRoute
): { minDate: string | undefined; maxDate: string | undefined } => {
  if ((tab === 'Commuter Rail' || tab === 'Bus') && route) {
    const minDate = stations[tab][route].service_start;
    const maxDate = stations[tab][route].service_end;
    return { minDate, maxDate };
  }
  return { minDate: undefined, maxDate: undefined };
};
