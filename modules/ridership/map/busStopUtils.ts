import { getBusRouteIds } from '../../../common/constants/lines';
import type { BusStopRidership, BusStopRidershipStop } from '../../../common/types/dataPoints';

/** Routes the MBTA counts under more GTFS IDs than their label names, as in getRidershipLineId */
const EXTRA_ROUTE_IDS: Record<string, string[]> = {
  '34': ['34', '34E'],
  '57': ['57', '57A'],
  CT2: ['747'],
};

export const getBusStopRidershipRouteIds = (busRoute: string) =>
  EXTRA_ROUTE_IDS[busRoute] ?? getBusRouteIds(busRoute);

/** The last fall before the pandemic */
export const BASELINE_SEASON = 'Fall 2019';

export const DIRECTION_LABELS: Record<number, string> = { 1: 'Inbound', 0: 'Outbound' };

export interface BusStopRidershipSelection {
  routeId?: string;
  season?: string;
  directionId?: number;
}

/**
 * The route, season and direction to show. Falls back to the first route with data, its latest
 * season and inbound wherever the selection isn't available, e.g. a season before a route began.
 */
export const resolveBusStopRidershipSelection = (
  routes: BusStopRidership[],
  selection: BusStopRidershipSelection
) => {
  const routesWithData = routes.filter((route) => route.seasons.length > 0);
  const route =
    routesWithData.find((candidate) => candidate.route_id === selection.routeId) ??
    routesWithData[0];
  if (!route) return null;

  const season =
    route.seasons.find((candidate) => candidate.season === selection.season) ??
    route.seasons[route.seasons.length - 1];
  const directionIds = season.directions
    .map((direction) => direction.direction_id)
    .sort((a, b) => b - a);
  const directionId =
    directionIds.find((id) => id === selection.directionId) ??
    directionIds.find((id) => id === 1) ??
    directionIds[0];
  const stops =
    season.directions.find((direction) => direction.direction_id === directionId)?.stops ?? [];

  return {
    routesWithData,
    route,
    season: season.season,
    seasons: route.seasons.map((candidate) => candidate.season),
    directionIds,
    directionId,
    stops,
  };
};

const getStop = (
  route: BusStopRidership,
  season: string,
  directionId: number,
  stopId: string
): BusStopRidershipStop | undefined =>
  route.seasons
    .find((candidate) => candidate.season === season)
    ?.directions.find((direction) => direction.direction_id === directionId)
    ?.stops.find((stop) => stop.stop_id === stopId);

export interface StopComparison {
  season: string;
  boardings: number;
  /** Change from that season to the selected one, left out when that season had too few riders */
  change?: number;
}

/**
 * The stop's boardings in the season before the selected one and in Fall 2019, for the seasons
 * where the stop was served in the same direction.
 */
export const getStopComparisons = (
  route: BusStopRidership,
  season: string,
  directionId: number,
  stopId: string
): StopComparison[] => {
  const current = getStop(route, season, directionId, stopId);
  const seasons = route.seasons.map((candidate) => candidate.season);
  const index = seasons.indexOf(season);
  if (!current || index < 0) return [];

  const compareTo = [seasons[index - 1]];
  if (seasons.indexOf(BASELINE_SEASON) < index - 1) compareTo.push(BASELINE_SEASON);

  return compareTo.flatMap((compareSeason) => {
    const previous = compareSeason && getStop(route, compareSeason, directionId, stopId);
    if (!previous) return [];
    return [
      {
        season: compareSeason,
        boardings: previous.boardings,
        // A percentage of a handful of riders is mostly noise
        change: previous.boardings >= 10 ? current.boardings / previous.boardings - 1 : undefined,
      },
    ];
  });
};

/** GTFS names like "Massachusetts Ave @ Holyoke St" are long for a label beside the line */
export const abbreviateBusStopName = ({ stationName }: { stationName: string }) =>
  stationName
    .replaceAll('Massachusetts Ave', 'Mass Ave')
    .replace(/ Station$/, '')
    .replace(/ Busway$/, '');
