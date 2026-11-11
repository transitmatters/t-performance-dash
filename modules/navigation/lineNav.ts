import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import {
  faBus,
  faShip,
  faTrain,
  faTrainSubway,
  faTrainTram,
} from '@fortawesome/free-solid-svg-icons';
import type { PageMetadata } from '../../common/constants/pages';
import {
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
import { getLineSelectionItemHref } from '../../common/utils/router';

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

export const hrefForLine = (line: Line, route: Route) => {
  switch (line) {
    case 'line-bus':
      return '/bus/?busRoute=1';
    case 'line-commuter-rail':
      return '/commuter-rail/?crRoute=CR-Fairmount';
    case 'line-ferry':
      return `/ferry/trips/single?ferryRoute=Boat-F6&date=${FERRY_DEFAULTS.singleTripConfig.date}`;
    case 'line-RIDE':
      return '/the-ride/ridership';
    default:
      return getLineSelectionItemHref(line, route);
  }
};
