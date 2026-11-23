import type { BusRoute, CommuterRailRoute, Line, LineShort, FerryRoute } from '../types/lines';
import { BUS_ROUTES, COMMUTER_RAIL_ROUTES } from '../types/lines';
import type { LineMap, RapidTransitLineShort, Station } from '../types/stations';
import type { Location } from '../types/charts';
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
const isRapidTransitLine = (line: LineShort): line is RapidTransitLineShort =>
  !isBusLine(line) && !isCommuterRailLine(line) && !isFerryLine(line) && line !== 'The RIDE';
const isCommuterRailRoute = (route: BusRoute | CommuterRailRoute): route is CommuterRailRoute =>
  COMMUTER_RAIL_ROUTES.some((crRoute) => crRoute === route);

const getRouteLineMap = (
  tab: 'Bus' | 'Commuter Rail',
  route: BusRoute | CommuterRailRoute
): LineMap | undefined => {
  if (isCommuterRailRoute(route)) {
    return tab === 'Commuter Rail' ? stations['Commuter Rail'][route] : undefined;
  }
  return tab === 'Bus' ? stations.Bus[route] : undefined;
};

/** What riders call the places a line serves: buses and ferries have stops, rail has stations. */
export const stopNoun = (line: LineShort | undefined): 'stop' | 'station' =>
  line && (isBusLine(line) || isFerryLine(line)) ? 'stop' : 'station';

// Helper function to safely get stations for a line
const getStationsForLine = (
  line: LineShort,
  route?: BusRoute | CommuterRailRoute
): Station[] | undefined => {
  if ((isBusLine(line) || isCommuterRailLine(line)) && route) {
    return getRouteLineMap(line, route)?.stations;
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
  return undefined;
};

export const optionsStation = (
  line: LineShort,
  busRoute?: BusRoute,
  crRoute?: CommuterRailRoute,
  ferryRoute?: FerryRoute
): Station[] | undefined => {
  if (!line || line === 'The RIDE') {
    return undefined;
  }

  if (isBusLine(line)) {
    if (!busRoute || !stations[line][busRoute]) {
      return undefined;
    }

    return stations[line][busRoute].stations.toSorted((a, b) => a.order - b.order);
  }

  if (isCommuterRailLine(line)) {
    if (!crRoute || !stations[line][crRoute]) {
      return undefined;
    }

    return stations[line][crRoute].stations.toSorted((a, b) => a.order - b.order);
  }

  if (isRapidTransitLine(line)) {
    return rtStations[line].stations.toSorted((a, b) => a.order - b.order);
  }

  if (isFerryLine(line)) {
    if (!ferryRoute || !ferryStations[ferryRoute]) {
      return undefined;
    }

    return ferryStations[ferryRoute].stations.toSorted((a, b) => a.order - b.order);
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

/** What each stop's line calls its two directions: westbound on the Green Line, inbound on a bus. */
const createDirectionNamesIndex = () => {
  const index: Record<string, LineMap['direction']> = {};
  Object.values({ ...rtStations, ...busStations, ...crStations, ...ferryStations }).forEach(
    (line) => {
      line.stations.forEach((station) => {
        [...station.stops['0'], ...station.stops['1']].forEach((stopId) => {
          index[stopId] = line.direction;
        });
      });
    }
  );
  return index;
};

const stationIndex = createStationIndex();
const parentStationIndex = createParentStationIndex();
const directionNamesIndex = createDirectionNamesIndex();

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
      (candidate: Station) =>
        candidate.stops['0'].includes(stopId) || candidate.stops['1'].includes(stopId)
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
const getTrunkStationFor = (from: Station, lineStations: Station[] | undefined) =>
  lineStations
    ?.filter((station) => station.station !== from.station && connects(from, station))
    .toSorted(
      (a, b) =>
        (b.branches?.length ?? 0) - (a.branches?.length ?? 0) ||
        Math.abs(a.order - from.order) - Math.abs(b.order - from.order)
    )[0];

export const getStationForInvalidFromSelection = (
  line: Line,
  from: Station,
  lineStations: Station[] | undefined
): Station | undefined => {
  if (line === 'line-green') return getParentStationForStopId('70202'); // Gov. Center
  if (line === 'line-red') return getParentStationForStopId('70076'); // Park St.
  return getTrunkStationFor(from, lineStations);
};

export function stopIdsForStations(
  from: Station,
  to: Station
): { fromStopIds: string[]; toStopIds: string[] };
export function stopIdsForStations(
  from: Station | undefined,
  to: Station | undefined
): { fromStopIds: string[] | undefined; toStopIds: string[] | undefined };
export function stopIdsForStations(from: Station | undefined, to: Station | undefined) {
  if (to === undefined || from === undefined) {
    return { fromStopIds: undefined, toStopIds: undefined };
  }

  const isDirection1 = from.order < to.order;
  const directionKey = isDirection1 ? '1' : '0';
  return {
    fromStopIds: from.stops[directionKey],
    toStopIds: to.stops[directionKey],
  };
}

/**
 * Names the direction the way the trip's own line does. Station order runs the way of the stops
 * keyed "1" (see stopIdsForStations), and each line names that key itself: southbound on Red,
 * westbound on Green, inbound on buses, Commuter Rail and ferries.
 */
const travelDirection = (from: Station, to: Station): Location['direction'] => {
  const key = from.order < to.order ? '1' : '0';
  const [stopId] = [...from.stops[key], ...from.stops[key === '1' ? '0' : '1']];
  const name = stopId ? directionNamesIndex[stopId]?.[key] : undefined;
  return (name as Location['direction'] | undefined) ?? (key === '1' ? 'southbound' : 'northbound');
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

export const findValidDefaultStations = (lineStations: Station[] | undefined) => {
  if (!lineStations?.length) return { defaultFrom: undefined, defaultTo: undefined };

  if (lineStations.length === 2) {
    const defaultFrom = lineStations[0];
    const defaultTo = lineStations[1];

    //if defaultFrom && defaultTo are not null and defaultFrom is not equal to defaultTo
    if (defaultFrom && defaultTo && defaultFrom.station !== defaultTo.station) {
      return { defaultFrom, defaultTo };
    }
  }

  // The second stop to the next one along that a trip runs between. On a combined route the next
  // stop in order can be on another branch, so it has to share one.
  for (const dir of ['1', '0'] as const) {
    const validStations = lineStations.filter((s) => s.stops[dir]?.length > 0);
    const ordered = dir === '1' ? validStations : [...validStations].toReversed();
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
  lineStations: Station[] | undefined
): Station | undefined =>
  lineStations?.find(
    (s) =>
      s.order > station.order &&
      s.station !== station.station &&
      s.stops[station.stops['1']?.length ? '1' : '0']?.length > 0
  );

/**
 * The closest station that a trip runs to from `station` (`end: 'from'`) or from it to `station`
 * (`end: 'to'`). Stations sharing its order are skipped, since order is what sets the direction.
 */
export const findNearestConnectingStation = (
  station: Station,
  lineStations: Station[] | undefined,
  end: 'from' | 'to'
): Station | undefined =>
  lineStations
    ?.filter(
      (s) =>
        s.order !== station.order && (end === 'from' ? connects(station, s) : connects(s, station))
    )
    .toSorted((a, b) => Math.abs(a.order - station.order) - Math.abs(b.order - station.order))[0];

/**
 * The GTFS stop_ids our station list has for a bus route, e.g. '29005' from '747-1-29005'. They
 * outlast the route itself, which drops out of MBTA's current feed once it's retired.
 */
export const getBusRouteStopIds = (busRoute: string): string[] =>
  (stations.Bus[busRoute as BusRoute]?.stations ?? []).flatMap(({ stops }) =>
    [...(stops['0'] ?? []), ...(stops['1'] ?? [])].map(
      (stopId) => stopId.split('-').pop() ?? stopId
    )
  );

export const getMinMaxDatesForRoute = (
  tab: Tab,
  route?: BusRoute | CommuterRailRoute
): { minDate: string | undefined; maxDate: string | undefined } => {
  if ((tab === 'Commuter Rail' || tab === 'Bus') && route) {
    const lineMap = getRouteLineMap(tab, route);
    return { minDate: lineMap?.service_start, maxDate: lineMap?.service_end };
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
