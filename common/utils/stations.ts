import type { BusRoute, CommuterRailRoute, Line, LineShort, FerryRoute } from '../types/lines';
import { BUS_ROUTES } from '../types/lines';
import { type Station } from '../types/stations';
import type { Location } from '../types/charts';
import type { Direction } from '../types/dataPoints';
import {
  stations,
  rtStations,
  busStations,
  crStations,
  ferryStations,
} from '../constants/stations';
import { getBusRouteDisplayName, getBusRouteIds } from '../constants/lines';
import type { Tab } from '../types/router';

// Type guards for line types
const isBusLine = (line: LineShort): line is 'Bus' => line === 'Bus';
const isCommuterRailLine = (line: LineShort): line is 'Commuter Rail' => line === 'Commuter Rail';
const isFerryLine = (line: LineShort): line is 'Ferry' => line === 'Ferry';
const isRapidTransitLine = (
  line: LineShort
): line is Exclude<LineShort, 'Bus' | 'Commuter Rail' | 'Ferry'> =>
  !isBusLine(line) && !isCommuterRailLine(line) && !isFerryLine(line);

/** What riders call the places a line serves: buses and ferries have stops, rail has stations. */
export const stopNoun = (line: LineShort | undefined): 'stop' | 'station' =>
  line && (isBusLine(line) || isFerryLine(line)) ? 'stop' : 'station';

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

const stationIndex = createStationIndex();
const parentStationIndex = createParentStationIndex();

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

/** The station serving a stop, if it is one of `options`; a stop from another line or route is not. */
export const getStationInOptions = (stopId: string | undefined, options: Station[] | undefined) =>
  stopId
    ? options?.find(
        (station) => station.stops['0'].includes(stopId) || station.stops['1'].includes(stopId)
      )
    : undefined;

const sharesBranch = (a: Station, b: Station) =>
  !a.branches || !b.branches || a.branches.some((branch) => b.branches?.includes(branch));

/** Whether a trip from `from` to `to` exists in the direction their order implies. */
const connects = (from: Station, to: Station) => {
  const { fromStopIds, toStopIds } = stopIdsForStations(from, to);
  return Boolean(fromStopIds?.length && toStopIds?.length) && sharesBranch(from, to);
};

/**
 * Where the trip should end when the new `from` station is on a branch the current `to` isn't:
 * the station on the most branches it shares a trip with (the trunk), nearest first.
 */
const getTrunkStationFor = (from: Station, stations: Station[] | undefined) =>
  stations
    ?.filter((station) => station.station !== from.station && connects(from, station))
    .sort(
      (a, b) =>
        (b.branches?.length ?? 0) - (a.branches?.length ?? 0) ||
        Math.abs(a.order - from.order) - Math.abs(b.order - from.order)
    )[0];

export const getStationForInvalidFromSelection = (
  line: Line,
  from: Station,
  stations: Station[] | undefined,
  ferryRoute?: FerryRoute
): Station | undefined => {
  if (line === 'line-green') return getParentStationForStopId('70202'); // Gov. Center
  if (line === 'line-red') return getParentStationForStopId('70076'); // Park St.
  if (line === 'line-ferry' && ferryRoute) {
    // Return the first ferry station for the route
    const { stations } = ferryStations[ferryRoute];
    return stations[0];
  }
  return getTrunkStationFor(from, stations);
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

  // The second stop to the next one along that a trip runs between. On a combined route the next
  // stop in order can be on another branch, so it has to share one.
  for (const dir of ['1', '0']) {
    const validStations = stations.filter((s) => s.stops[dir]?.length > 0);
    const ordered = dir === '1' ? validStations : [...validStations].reverse();
    for (const defaultFrom of [ordered[1], ordered[0]]) {
      if (!defaultFrom) continue;
      const defaultTo = ordered.find(
        (s) =>
          (dir === '1' ? s.order > defaultFrom.order : s.order < defaultFrom.order) &&
          connects(defaultFrom, s)
      );
      if (defaultTo) return { defaultFrom, defaultTo };
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
    const minDate = stations[tab][route]?.service_start;
    const maxDate = stations[tab][route]?.service_end;
    return { minDate, maxDate };
  }
  return { minDate: undefined, maxDate: undefined };
};

/**
 * The curated BusRoute label a raw GTFS route_id is shown under on `date`, e.g. '751' -> 'SL4/SL5'.
 * Bus trip-metrics data is keyed by raw route_ids, but everywhere else the dashboard presents
 * the curated labels, so anything ranking or listing routes should group by this to stay
 * consistent. A route_id can move between labels over time (BNRD split 104/109 into 104 and
 * 109 on 2024-12-15), so only labels whose service window covers `date` count. Route_ids with
 * no curated label fall back to their display name, which getBusRouteIds still resolves.
 */
export const getBusRouteGroup = (routeId: string, date: string): string =>
  BUS_ROUTES.find((busRoute) => {
    const { service_start, service_end } = stations.Bus[busRoute] ?? {};
    return (
      getBusRouteIds(busRoute).includes(routeId) &&
      (!service_start || service_start <= date) &&
      (!service_end || date <= service_end)
    );
  }) ?? getBusRouteDisplayName(routeId);
