import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import {
  faMapLocationDot,
  faHouse,
  faUsers,
  faWarning,
  faClockFour,
  faGaugeHigh,
  faTableColumns,
  faStopwatch20,
  faCalendarDays,
  faCalendarXmark,
  faTrain,
  faMap,
  faRankingStar,
} from '@fortawesome/free-solid-svg-icons';
import type { BusRoute, Line } from '../types/lines';

export type Page = keyof typeof PAGES;

export enum PAGES {
  landing = 'landing',
  overview = 'overview',
  speed = 'speed',
  fleet = 'fleet',
  predictions = 'predictions',
  delays = 'delays',
  service = 'service',
  slowzones = 'slowzones',
  systemSlowzones = 'systemSlowzones',
  systemServiceAndRidership = 'systemServiceAndRidership',
  ridership = 'ridership',
  singleTrips = 'singleTrips',
  multiTrips = 'multiTrips',
  // Must stay identical to the URL segment: getPage() in common/utils/router.tsx returns
  // the raw path segment for a top-level page, and ALL_PAGES is indexed by the result.
  speedmap = 'speedmap',
  leaderboard = 'leaderboard',
}

export type DateStoreSection =
  'landing' | 'today' | 'line' | 'overview' | 'singleTrips' | 'multiTrips' | 'system';

export type PageMetadata = {
  key: string;
  path: string;
  name: string;
  lines: Line[];
  icon: IconDefinition;
  hasStationStore?: boolean;
  // Defaults to true. The leaderboard ranks across all routes at once, so it has no single
  // route to parameterize the page with.
  hasRouteSelector?: boolean;
  // Route to open on when navigating in without one already selected, e.g. from the
  // leaderboard, which carries no busRoute of its own.
  defaultBusRoute?: BusRoute;
  dateStoreSection: DateStoreSection;
  title?: string;
};

export type PageMap = {
  [key in PAGES]: PageMetadata;
};

export const ALL_PAGES: PageMap = {
  landing: {
    key: 'landing',
    path: '/',
    name: 'Home',
    lines: [],
    icon: faHouse,
    dateStoreSection: 'landing',
  },
  singleTrips: {
    key: 'singleTrips',
    path: '/trips/single',
    name: 'Trips',
    title: 'Trips',
    lines: [
      'line-red',
      'line-blue',
      'line-green',
      'line-orange',
      'line-mattapan',
      'line-commuter-rail',
      'line-bus',
      'line-ferry',
    ],
    icon: faMapLocationDot,
    hasStationStore: true,
    dateStoreSection: 'singleTrips',
  },
  multiTrips: {
    key: 'multiTrips',
    path: '/trips/multi',
    name: 'Multi-day trips',
    title: 'Multi-day trips',
    lines: [
      'line-red',
      'line-blue',
      'line-green',
      'line-orange',
      'line-mattapan',
      'line-commuter-rail',
      'line-bus',
      'line-ferry',
    ],
    icon: faCalendarDays,
    dateStoreSection: 'multiTrips',
    hasStationStore: true,
  },
  overview: {
    key: 'overview',
    path: '/',
    name: 'Line overview',
    lines: ['line-red', 'line-blue', 'line-green', 'line-orange', 'line-mattapan'],
    dateStoreSection: 'overview',
    icon: faTableColumns,
  },
  speed: {
    key: 'speed',
    path: '/speed',
    name: 'Speed',
    lines: ['line-red', 'line-orange', 'line-blue', 'line-green', 'line-mattapan', 'line-bus'],
    icon: faGaugeHigh,
    dateStoreSection: 'line',
  },
  fleet: {
    key: 'fleet',
    path: '/fleet',
    name: 'Fleet',
    lines: ['line-red', 'line-orange', 'line-blue', 'line-green', 'line-mattapan'],
    icon: faTrain,
    dateStoreSection: 'line',
  },
  predictions: {
    key: 'predictions',
    path: '/predictions',
    name: 'Predictions',
    lines: ['line-red', 'line-orange', 'line-blue', 'line-green', 'line-mattapan'],
    icon: faStopwatch20,
    dateStoreSection: 'line',
  },
  service: {
    key: 'service',
    path: '/service',
    name: 'Service',
    lines: ['line-red', 'line-orange', 'line-blue', 'line-green', 'line-mattapan'],
    dateStoreSection: 'line',
    icon: faClockFour,
  },
  delays: {
    key: 'delays',
    path: '/delays',
    name: 'Delays',
    lines: [
      'line-red',
      'line-orange',
      'line-blue',
      'line-green',
      'line-mattapan',
      'line-commuter-rail',
    ],
    icon: faCalendarXmark,
    dateStoreSection: 'line',
  },
  slowzones: {
    key: 'slowzones',
    path: '/slowzones',
    name: 'Slow zones',
    lines: ['line-red', 'line-blue', 'line-orange', 'line-green', 'line-mattapan'],
    icon: faWarning,
    dateStoreSection: 'line',
  },
  systemSlowzones: {
    key: 'systemSlowzones',
    path: '/slowzones',
    name: 'Slow zones',
    lines: [],
    icon: faWarning,
    dateStoreSection: 'system',
  },
  systemServiceAndRidership: {
    key: 'systemServiceAndRidership',
    path: '/ridership',
    name: 'Service & Ridership',
    lines: [],
    icon: faUsers,
    dateStoreSection: 'system',
  },
  ridership: {
    key: 'ridership',
    path: '/ridership',
    name: 'Ridership',
    lines: [
      'line-red',
      'line-blue',
      'line-green',
      'line-orange',
      'line-bus',
      'line-commuter-rail',
      'line-ferry',
      'line-RIDE',
    ],
    icon: faUsers,
    dateStoreSection: 'line',
  },
  speedmap: {
    key: 'speedmap',
    path: '/speedmap',
    name: 'Speed map',
    title: 'Bus speed map',
    lines: ['line-bus'],
    icon: faMap,
    // Route 1, same as the rest of the bus pages' entry points.
    defaultBusRoute: '1',
    // 'singleTrips' is the only section whose stored selection is a single date, and
    // sharing it means the chosen service date carries over to and from the trips pages.
    dateStoreSection: 'singleTrips',
  },
  leaderboard: {
    key: 'leaderboard',
    path: '/leaderboard',
    name: 'Leaderboard',
    title: 'Bus speed leaderboard',
    lines: ['line-bus'],
    icon: faRankingStar,
    // Ranks across every route or segment at once, so there's no single route to
    // parameterize the page with.
    hasRouteSelector: false,
    // Single date rather than a range: the "by segment" view's day/week/month files are
    // precomputed alongside the speed map's pmtiles from the same generation step, and only
    // cover those same materialized periods, not an arbitrary range. The "by route" view
    // derives its own start/end range from this same single date + period (periodDateRange in
    // modules/busspeedmap/utils.ts) rather than getting a second, mismatched date control.
    dateStoreSection: 'singleTrips',
  },
};

/* Groups of pages for tab sections */
export const TRIP_PAGES = [ALL_PAGES.singleTrips, ALL_PAGES.multiTrips];

/* Multi-day trips is reached from the in-page TripModeToggle, not the sidebar */
export const NAV_TRIP_PAGES = [ALL_PAGES.singleTrips];

export const BUS_OVERVIEW = [
  ALL_PAGES.ridership,
  ALL_PAGES.speed,
  ALL_PAGES.speedmap,
  ALL_PAGES.leaderboard,
];

export const COMMUTER_RAIL_OVERVIEW = [ALL_PAGES.ridership];

export const FERRY_OVERVIEW = [ALL_PAGES.ridership];

export const RIDE_OVERVIEW = [ALL_PAGES.ridership];

export const OVERVIEW_PAGE = [ALL_PAGES.overview];

export const LINE_PAGES = [
  ALL_PAGES.service,
  ALL_PAGES.slowzones,
  ALL_PAGES.speed,
  ALL_PAGES.fleet,
  ALL_PAGES.predictions,
  ALL_PAGES.delays,
  ALL_PAGES.ridership,
];

export const SUB_PAGES_MAP = {
  trips: {
    single: 'singleTrips',
    multi: 'multiTrips',
  },
  system: {
    slowzones: 'systemSlowzones',
    ridership: 'systemServiceAndRidership',
  },
};

export const SYSTEM_PAGES_MAP = {
  system: {
    slowzones: 'systemSlowzones',
    ridership: 'systemServiceAndRidership',
  },
};

export const LANDING_PAGE = [ALL_PAGES.landing];

export const SYSTEM_SUB_PAGES = [ALL_PAGES.systemSlowzones, ALL_PAGES.systemServiceAndRidership];
