import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import {
  faBus,
  faShip,
  faTrain,
  faTrainSubway,
  faTrainTram,
} from '@fortawesome/free-solid-svg-icons';
import { pickBy } from '@lodash-utils';
import type { PageMetadata } from '../../common/constants/pages';
import {
  ALL_PAGES,
  BUS_OVERVIEW,
  COMMUTER_RAIL_OVERVIEW,
  FERRY_OVERVIEW,
  LINE_PAGES,
  NAV_TRIP_PAGES,
  OVERVIEW_PAGE,
} from '../../common/constants/pages';
import { FERRY_DEFAULTS } from '../../common/state/defaults/dateDefaults';
import type { Line } from '../../common/types/lines';
import type { Route } from '../../common/types/router';
import {
  DEFAULT_ROUTE_FOR_LINE,
  ROUTE_PARAMS,
  getBusRouteSelectionItemHref,
  getCommuterRailRouteSelectionItemHref,
  getFerryRouteSelectionItemHref,
  getLineSelectionItemHref,
} from '../../common/utils/router';

export const NAV_LINES: Line[] = [
  'line-red',
  'line-orange',
  'line-blue',
  'line-green',
  'line-mattapan',
  'line-bus',
  'line-commuter-rail',
  'line-RIDE',
  'line-ferry',
];

export const lineIcon = (line: Line): IconDefinition => {
  switch (line) {
    case 'line-bus':
    case 'line-RIDE':
      return faBus;
    case 'line-green':
    case 'line-mattapan':
      return faTrainTram;
    case 'line-commuter-rail':
      return faTrain;
    case 'line-ferry':
      return faShip;
    default:
      return faTrainSubway;
  }
};

/** The pages each mode actually supports. Modes differ, so this is per-line rather than shared. */
export const pagesForLine = (line: Line): PageMetadata[] => {
  const forThisLine = LINE_PAGES.filter((page) => page.lines.includes(line));
  switch (line) {
    case 'line-bus':
      return [...BUS_OVERVIEW, ...NAV_TRIP_PAGES];
    case 'line-commuter-rail':
      return [
        ...COMMUTER_RAIL_OVERVIEW,
        ...forThisLine.filter((page) => !COMMUTER_RAIL_OVERVIEW.includes(page)),
        ...NAV_TRIP_PAGES,
      ];
    case 'line-ferry':
      return [...FERRY_OVERVIEW, ...NAV_TRIP_PAGES];
    case 'line-RIDE':
      return forThisLine;
    default:
      return [...OVERVIEW_PAGE, ...forThisLine, ...NAV_TRIP_PAGES];
  }
};

const FERRY_ENTRY_PATH = '/ferry/trips/single/';
const RIDE_ENTRY_PATH = '/the-ride/ridership/';

/** Where a line without an overview opens instead. */
export const LINE_ENTRY_PATHS: Partial<Record<Line, string>> = {
  'line-ferry': FERRY_ENTRY_PATH,
  'line-RIDE': RIDE_ENTRY_PATH,
};

const ROUTE_HREF_FOR_LINE: Partial<Record<Line, (newRoute: string, route: Route) => string>> = {
  'line-bus': getBusRouteSelectionItemHref,
  'line-commuter-rail': getCommuterRailRouteSelectionItemHref,
  'line-ferry': getFerryRouteSelectionItemHref,
};

/**
 * Params that only mean something on the line they were picked on: its route, a bus route's
 * branch (`routeId`), and the Overview's date preset (`view`, dropped by getLineSelectionItemHref
 * too).
 */
const LINE_SCOPED_PARAMS = [...ROUTE_PARAMS, 'routeId', 'view'];

/**
 * Where a line's link goes: another line's version of the current page when it has one, on the
 * mode's default route, and the line's entry page otherwise. The current line's own link always
 * goes to its entry page.
 */
export const hrefForLine = (line: Line, route: Route) => {
  const keepsPage = line !== route.line && !!ALL_PAGES[route.page]?.lines.includes(line);
  const routeHref = ROUTE_HREF_FOR_LINE[line];
  const defaultRoute = DEFAULT_ROUTE_FOR_LINE[line];
  if (keepsPage && routeHref && defaultRoute) {
    const query = pickBy(route.query, (_, key) => !LINE_SCOPED_PARAMS.includes(key));
    return routeHref(defaultRoute, { ...route, query });
  }
  switch (line) {
    case 'line-bus':
      return '/bus/?busRoute=1';
    case 'line-commuter-rail':
      return '/commuter-rail/?crRoute=CR-Fairmount';
    case 'line-ferry':
      return `${FERRY_ENTRY_PATH}?ferryRoute=Boat-F6&date=${FERRY_DEFAULTS.singleTripConfig.date}`;
    case 'line-RIDE':
      return keepsPage ? getLineSelectionItemHref(line, route) : RIDE_ENTRY_PATH;
    default:
      return getLineSelectionItemHref(line, route);
  }
};
