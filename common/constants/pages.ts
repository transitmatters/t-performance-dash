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
  faCalendarWeek,
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
  sdHeadways = 'sdHeadways',
  sdTraveltimes = 'sdTraveltimes',
  sdDwells = 'sdDwells',
  rangeHeadways = 'rangeHeadways',
  rangeTraveltimes = 'rangeTraveltimes',
  rangeDwells = 'rangeDwells',
  range = 'range',
}

type Section = 'today' | 'line' | 'overview' | 'trips';

export type NavTab = {
  key: string;
  path: string;
  name: string;
  lines: Line[];
  icon: IconDefinition;
  section: Section;
  sub?: boolean;
  title?: string;
};

export type NavTabMap = {
  [key in PAGES]: NavTab;
};

export const ALL_PAGES: NavTabMap = {
  today: {
    key: 'today',
    path: '/',
    name: 'Today',
    lines: ['RL', 'BL', 'GL', 'OL'],
    icon: faHouse,
    section: 'today',
  },
  trips: {
    key: 'trips',
    path: '/trips',
    name: 'Overview',
    title: 'Trip Overview',
    lines: ['RL', 'BL', 'GL', 'OL', 'BUS'],
    icon: faMapLocation,
    section: 'trips',
  },
  sdHeadways: {
    key: 'sdHeadways',
    path: '/singleday/headways',
    name: 'Headways',
    lines: ['RL', 'BL', 'GL', 'OL', 'BUS'],
    icon: faArrowsLeftRightToLine,
    section: 'trips',
    sub: true,
  },
  sdTraveltimes: {
    key: 'sdTraveltimes',
    path: '/singleday/traveltimes',
    name: 'Travel Times',
    lines: ['RL', 'BL', 'GL', 'OL', 'BUS'],
    icon: faClock,
    section: 'trips',
    sub: true,
  },
  sdDwells: {
    key: 'sdDwells',
    path: '/singleday/dwells',
    name: 'Dwells',
    lines: ['RL', 'BL', 'GL', 'OL'],
    icon: faHourglass,
    section: 'trips',
    sub: true,
  },
  range: {
    key: 'range',
    path: '/range',
    name: 'Range',
    lines: ['RL', 'BL', 'GL', 'OL', 'BUS'],
    section: 'trips',
    icon: faCalendarWeek,
  },
  rangeHeadways: {
    key: 'rangeHeadways',
    path: '/range/headways',
    name: 'Headways',
    lines: ['RL', 'BL', 'GL', 'OL', 'BUS'],
    icon: faArrowsLeftRightToLine,
    section: 'trips',
    sub: true,
  },
  rangeTraveltimes: {
    key: 'rangeTraveltimes',
    path: '/range/traveltimes',
    name: 'Travel Times',
    lines: ['RL', 'BL', 'GL', 'OL', 'BUS'],
    icon: faClock,
    section: 'trips',
    sub: true,
  },
  rangeDwells: {
    key: 'rangeDwells',
    path: '/range/dwells',
    name: 'Dwells',
    lines: ['RL', 'BL', 'GL', 'OL'],
    icon: faHourglass,
    section: 'trips',
    sub: true,
  },
  overview: {
    key: 'overview',
    path: '/overview',
    name: 'Overview',
    lines: ['RL', 'BL', 'GL', 'OL'],
    section: 'overview',
    icon: faTableColumns,
  },
  speed: {
    key: 'speed',
    path: '/speed',
    name: 'Speed',
    lines: [],
    icon: faGaugeHigh,
    section: 'line',
    sub: true,
  },
  service: {
    key: 'service',
    path: '/service',
    name: 'Service',
    lines: [],
    section: 'line',
    icon: faClockFour,
    sub: true,
  },
  slowzones: {
    key: 'slowzones',
    path: '/slowzones',
    name: 'Slow Zones',
    lines: ['RL', 'BL', 'OL'],
    icon: faWarning,
    section: 'line',
    sub: true,
  },
  headways: {
    key: 'headways',
    path: '/headways',
    name: 'Headways',
    lines: [],
    icon: faArrowsLeftRightToLine,
    section: 'line',
    sub: true,
  },
  ridership: {
    key: 'ridership',
    path: '/ridership',
    name: 'Ridership',
    lines: ['RL', 'BL', 'GL', 'OL', 'BUS'],
    icon: faUsers,
    section: 'line',
    sub: true,
  },
};

/* Groups of pages for tab sections */
export const TRIP_PAGES = [
  ALL_PAGES.trips,
  ALL_PAGES.sdTraveltimes,
  ALL_PAGES.sdHeadways,
  ALL_PAGES.sdDwells,
];

export const TODAY = [ALL_PAGES.today];

export const BUS_OVERVIEW = [ALL_PAGES.ridership];

export const BUS_PAGES = [ALL_PAGES.trips, ALL_PAGES.sdTraveltimes, ALL_PAGES.sdHeadways];

export const LINE_PAGES = [
  ALL_PAGES.overview,
  ALL_PAGES.speed,
  ALL_PAGES.service,
  ALL_PAGES.slowzones,
  ALL_PAGES.headways,
  ALL_PAGES.ridership,
];

export const SUB_PAGES_MAP = {
  singleday: {
    headways: 'sdHeadways',
    traveltimes: 'sdTraveltimes',
    dwells: 'sdDwells',
  },
  range: {
    headways: 'rangeHeadways',
    traveltimes: 'rangeTraveltimes',
    dwells: 'rangeDwells',
  },
};
