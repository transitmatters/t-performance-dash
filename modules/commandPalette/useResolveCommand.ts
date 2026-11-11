import { useCallback } from 'react';
import type { Href } from '../../common/components/general/Link';
import { LINE_OBJECTS } from '../../common/constants/lines';
import { ALL_PAGES } from '../../common/constants/pages';
import type { Line } from '../../common/types/lines';
import type { QueryParams } from '../../common/types/router';
import type { Station } from '../../common/types/stations';
import {
  getBusRouteSelectionItemHref,
  getCommuterRailRouteSelectionItemHref,
  getFerryRouteSelectionItemHref,
  useDelimitatedRoute,
  useGenerateHref,
  useHandleConfigStore,
} from '../../common/utils/router';
import {
  findNextValidStation,
  getStationForInvalidFromSelection,
  optionsStation,
  stopIdsForStations,
} from '../../common/utils/stations';
import { hrefForLine } from '../navigation/lineNav';
import type { CommandTarget, RouteLine } from './commandIndex';

const ROUTE_PARAM: Record<RouteLine, 'busRoute' | 'crRoute' | 'ferryRoute'> = {
  'line-bus': 'busRoute',
  'line-commuter-rail': 'crRoute',
  'line-ferry': 'ferryRoute',
};

/** Params that only mean something on the line and route they were picked on. */
const SCOPED_PARAMS = ['from', 'to', 'view', 'busRoute', 'crRoute', 'ferryRoute'];

const withoutScopedParams = (query: QueryParams): QueryParams =>
  Object.fromEntries(Object.entries(query).filter(([key]) => !SCOPED_PARAMS.includes(key)));

const pathFor = (line: Line) => LINE_OBJECTS[line].path;

/** Where a trip starting at `from` should end: the line's usual trunk stop, else a neighbour. */
const tripEndFor = (line: Line, from: Station, options: Station[] | undefined) => {
  const trunk = getStationForInvalidFromSelection(line, from, options);
  if (trunk && trunk.station !== from.station) return trunk;
  return (
    findNextValidStation(from, options) ??
    options
      ?.filter((station) => station.order < from.order && station.station !== from.station)
      .at(-1)
  );
};

/**
 * Turns a command's target into the href it opens, built by the same helpers the sidebar and route
 * selector use, so dates and remembered stations carry over the same way.
 */
export const useResolveCommand = () => {
  const route = useDelimitatedRoute();
  const generateHref = useGenerateHref();
  const handlePageConfig = useHandleConfigStore();

  return useCallback(
    (target: CommandTarget): Href | undefined => {
      switch (target.kind) {
        case 'href':
          return target.href;
        case 'line':
          return hrefForLine(target.line, route);
        case 'route':
          if (target.line === 'line-commuter-rail')
            return getCommuterRailRouteSelectionItemHref(target.route, route);
          if (target.line === 'line-ferry')
            return getFerryRouteSelectionItemHref(target.route, route);
          return getBusRouteSelectionItemHref(target.route, route);
        case 'page': {
          const routeParam = target.route ? ROUTE_PARAM[target.line as RouteLine] : undefined;
          const sameScope =
            target.line === route.line && (!routeParam || route.query[routeParam] === target.route);
          const query = sameScope ? route.query : withoutScopedParams(route.query);
          handlePageConfig(target.page);
          return generateHref(
            target.page,
            route.page,
            routeParam ? { ...query, [routeParam]: target.route } : query,
            pathFor(target.line)
          );
        }
        case 'station': {
          const { line, lineShort, crRoute, station } = target;
          const query = withoutScopedParams(route.query);
          const base = generateHref(
            ALL_PAGES.singleTrips,
            route.page,
            crRoute ? { ...query, crRoute } : query,
            pathFor(line)
          );
          const end = tripEndFor(line, station, optionsStation(lineShort, undefined, crRoute));
          const { fromStopIds, toStopIds } = stopIdsForStations(station, end);
          handlePageConfig(ALL_PAGES.singleTrips);
          return {
            pathname: base.pathname,
            query: { ...base.query, from: fromStopIds?.[0], to: toStopIds?.[0] },
          };
        }
        case 'action':
          return undefined;
      }
    },
    [route, generateHref, handlePageConfig]
  );
};
