import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import {
  faMapLocationDot,
  faCalendar,
  faHouse,
  faUsers,
  faWarning,
  faClockFour,
  faGaugeHigh,
  faTableColumns,
} from '@fortawesome/free-solid-svg-icons';
import type { Line } from '../types/lines';

export type Page = keyof typeof PAGES;

export enum PAGES {
  landing = 'landing',
  today = 'today',
  overview = 'overview',
  speed = 'speed',
  service = 'service',
  slowzones = 'slowzones',
  systemSlowzones = 'systemSlowzones',
  ridership = 'ridership',
  singleTrips = 'singleTrips',
  multiTrips = 'multiTrips',
}

export type DateStoreSection =
  | 'landing'
  | 'today'
  | 'line'
  | 'overview'
  | 'singleTrips'
  | 'multiTrips'
  | 'system';
export type SectionTitle = 'Today' | 'Line' | 'Overview' | 'Trips' | 'System';

export type PageMetadata = {
  key: string;
  path: string;
  name: string;
  lines: Line[];
  icon: IconDefinition;
  hasStationStore?: boolean;
  dateStoreSection: DateStoreSection;
  sectionTitle?: SectionTitle;
  sub?: boolean;
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
  today: {
    key: 'today',
    path: '/',
    name: 'Today',
    lines: ['line-red', 'line-blue', 'line-green', 'line-orange'],
    icon: faHouse,
    dateStoreSection: 'today',
  },
  singleTrips: {
    key: 'singleTrips',
    path: '/trips/single',
    name: 'Trips',
    title: 'Trips',
    lines: ['line-red', 'line-blue', 'line-green', 'line-orange', 'line-bus'],
    icon: faMapLocationDot,
    hasStationStore: true,
    dateStoreSection: 'singleTrips',
  },
  multiTrips: {
    key: 'multiTrips',
    path: '/trips/multi',
    name: 'Multi-day trips',
    title: 'Multi-day trips',
    lines: ['line-red', 'line-blue', 'line-green', 'line-orange', 'line-bus'],
    icon: faCalendar,
    dateStoreSection: 'multiTrips',
    hasStationStore: true,
  },
  overview: {
    key: 'overview',
    path: '/',
    name: 'Line overview',
    lines: ['line-red', 'line-blue', 'line-green', 'line-orange'],
    dateStoreSection: 'overview',
    icon: faTableColumns,
  },
  speed: {
    key: 'speed',
    path: '/speed',
    name: 'Speed',
    lines: ['line-red', 'line-orange', 'line-blue', 'line-green'],
    icon: faGaugeHigh,
    dateStoreSection: 'line',
    sectionTitle: 'Line',
  },
  service: {
    key: 'service',
    path: '/service',
    name: 'Service',
    lines: ['line-red', 'line-orange', 'line-blue', 'line-green'],
    dateStoreSection: 'line',
    sectionTitle: 'Line',
    icon: faClockFour,
  },
  slowzones: {
    key: 'slowzones',
    path: '/slowzones',
    name: 'Slow zones',
    lines: ['line-red', 'line-blue', 'line-orange'],
    icon: faWarning,
    dateStoreSection: 'line',
    sectionTitle: 'Line',
  },
  systemSlowzones: {
    key: 'systemSlowzones',
    path: '/slowzones',
    name: 'Slow zones',
    lines: [],
    icon: faWarning,
    dateStoreSection: 'system',
    sectionTitle: 'System',
  },
  ridership: {
    key: 'ridership',
    path: '/ridership',
    name: 'Ridership',
    lines: ['line-red', 'line-blue', 'line-green', 'line-orange', 'line-bus'],
    icon: faUsers,
    dateStoreSection: 'line',
    sectionTitle: 'Line',
  },
};

/* Groups of pages for tab sections */
export const TRIP_PAGES = [ALL_PAGES.singleTrips, ALL_PAGES.multiTrips];

export const TODAY = [ALL_PAGES.today];

export const BUS_OVERVIEW = [ALL_PAGES.ridership];

export const OVERVIEW_PAGE = [
  ALL_PAGES.overview
]

export const LINE_PAGES = [
  ALL_PAGES.service,
  ALL_PAGES.slowzones,
  ALL_PAGES.speed,
  ALL_PAGES.ridership,
];

export const SUB_PAGES_MAP = {
  trips: {
    single: 'singleTrips',
    multi: 'multiTrips',
  },
  system: {
    slowzones: 'systemSlowzones',
  },
};

export const SYSTEM_PAGES_MAP = {
  system: {
    slowzones: 'systemSlowzones',
  },
};

export const LANDING_PAGE = [ALL_PAGES.landing];

export const SYSTEM_SLOWZONES_PAGE = [ALL_PAGES.systemSlowzones];
