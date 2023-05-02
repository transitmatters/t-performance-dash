import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import {
  faMapLocation,
  faHourglass,
  faClock,
  faHouse,
  faUsers,
  faArrowsLeftRightToLine,
  faWarning,
  faClockFour,
  faGaugeHigh,
  faTableColumns,
} from '@fortawesome/free-solid-svg-icons';
import type { Line } from '../types/lines';

export type Page = keyof typeof PAGES;

export enum PAGES {
  today = 'today',
  overview = 'overview',
  speed = 'speed',
  service = 'service',
  slowzones = 'slowzones',
  headways = 'headways',
  ridership = 'ridership',
  trips = 'trips',
  tripHeadways = 'tripHeadways',
  tripTraveltimes = 'tripTraveltimes',
  tripDwells = 'tripDwells',
}

export type Section = 'today' | 'line' | 'overview' | 'trips';
export type SectionTitle = 'Today' | 'Line' | 'Overview' | 'Trips';

export type PageMetadata = {
  key: string;
  path: string;
  name: string;
  lines: Line[];
  icon: IconDefinition;
  section: Section;
  sectionTitle?: SectionTitle;
  sub?: boolean;
  title?: string;
};

export type PageMap = {
  [key in PAGES]: PageMetadata;
};

export const ALL_PAGES: PageMap = {
  today: {
    key: 'today',
    path: '/',
    name: 'Today',
    lines: ['line-red', 'line-blue', 'line-green', 'line-orange'],
    icon: faHouse,
    section: 'today',
  },
  trips: {
    key: 'trips',
    path: '/trips',
    name: 'Trips',
    title: 'Trips',
    lines: ['line-red', 'line-blue', 'line-green', 'line-orange', 'line-bus'],
    icon: faMapLocation,
    section: 'trips',
  },
  tripHeadways: {
    key: 'tripHeadways',
    path: '/trips/headways',
    name: 'Headways',
    lines: ['line-red', 'line-blue', 'line-green', 'line-orange', 'line-bus'],
    icon: faArrowsLeftRightToLine,
    section: 'trips',
    sectionTitle: 'Trips',
    sub: true,
  },
  tripTraveltimes: {
    key: 'tripTraveltimes',
    path: '/trips/traveltimes',
    name: 'Travel Times',
    lines: ['line-red', 'line-blue', 'line-green', 'line-orange', 'line-bus'],
    icon: faClock,
    section: 'trips',
    sectionTitle: 'Trips',
    sub: true,
  },
  tripDwells: {
    key: 'tripDwells',
    path: '/trips/dwells',
    name: 'Dwells',
    lines: ['line-red', 'line-blue', 'line-green', 'line-orange'],
    icon: faHourglass,
    section: 'trips',
    sectionTitle: 'Trips',
    sub: true,
  },
  overview: {
    key: 'overview',
    path: '/overview',
    name: 'Line',
    lines: ['line-red', 'line-blue', 'line-green', 'line-orange'],
    section: 'overview',
    icon: faTableColumns,
  },
  speed: {
    key: 'speed',
    path: '/speed',
    name: 'Speed',
    lines: ['line-red', 'line-orange', 'line-blue'],
    icon: faGaugeHigh,
    section: 'line',
    sectionTitle: 'Line',
    sub: true,
  },
  service: {
    key: 'service',
    path: '/service',
    name: 'Service',
    lines: ['RL', 'OL', 'BL'],
    section: 'line',
    sectionTitle: 'Line',
    icon: faClockFour,
    sub: true,
  },
  slowzones: {
    key: 'slowzones',
    path: '/slowzones',
    name: 'Slow Zones',
    lines: ['line-red', 'line-blue', 'line-orange'],
    icon: faWarning,
    section: 'line',
    sectionTitle: 'Line',
    sub: true,
  },
  headways: {
    key: 'headways',
    path: '/headways',
    name: 'Headways',
    lines: [],
    icon: faArrowsLeftRightToLine,
    section: 'line',
    sectionTitle: 'Line',
    sub: true,
  },
  ridership: {
    key: 'ridership',
    path: '/ridership',
    name: 'Ridership',
    lines: ['line-red', 'line-blue', 'line-green', 'line-orange', 'line-bus'],
    icon: faUsers,
    section: 'line',
    sectionTitle: 'Line',
    sub: true,
  },
};

/* Groups of pages for tab sections */
export const TRIP_PAGES = [
  ALL_PAGES.trips,
  ALL_PAGES.tripTraveltimes,
  ALL_PAGES.tripHeadways,
  ALL_PAGES.tripDwells,
];

export const TODAY = [ALL_PAGES.today];

export const BUS_OVERVIEW = [ALL_PAGES.ridership];

export const BUS_PAGES = [ALL_PAGES.trips, ALL_PAGES.tripTraveltimes, ALL_PAGES.tripHeadways];

export const LINE_PAGES = [
  ALL_PAGES.overview,
  ALL_PAGES.service,
  ALL_PAGES.slowzones,
  ALL_PAGES.headways,
  ALL_PAGES.speed,
  ALL_PAGES.ridership,
];

export const SUB_PAGES_MAP = {
  trips: {
    headways: 'tripHeadways',
    traveltimes: 'tripTraveltimes',
    dwells: 'tripDwells',
  },
};
