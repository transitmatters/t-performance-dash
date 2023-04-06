import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import {
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
  faCalendarDay,
} from '@fortawesome/free-solid-svg-icons';
import type { Line } from '../types/lines';

export type Page =
  | 'today'
  | 'overview'
  | 'speed'
  | 'service'
  | 'slowzones'
  | 'headways'
  | 'ridership'
  | 'singleday'
  | 'sdHeadways'
  | 'sdTraveltimes'
  | 'sdDwells'
  | 'rangeHeadways'
  | 'rangeTraveltimes'
  | 'rangeDwells'
  | 'range';

export enum PAGES {
  today = 'today',
  overview = 'overview',
  speed = 'speed',
  service = 'service',
  slowzones = 'slowzones',
  headways = 'headways',
  ridership = 'ridership',
  singleday = 'singleday',
  sdHeadways = 'sdHeadways',
  sdTraveltimes = 'sdTraveltimes',
  sdDwells = 'sdDwells',
  rangeHeadways = 'rangeHeadways',
  rangeTraveltimes = 'rangeTraveltimes',
  rangeDwells = 'rangeDwells',
  range = 'range',
}

type Section = 'today' | 'line' | 'overview' | 'single' | 'range';

export type NavTab = {
  key: string;
  path: string;
  name: string;
  lines: Line[];
  icon: IconDefinition;
  section: Section;
  sub?: boolean;
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
  singleday: {
    key: 'singleday',
    path: '/singleday',
    name: 'Single Day',
    lines: ['RL', 'BL', 'GL', 'OL', 'BUS'],
    icon: faCalendarDay,
    section: 'single',
  },
  sdHeadways: {
    key: 'sdHeadways',
    path: '/singleday/headways',
    name: 'Headways',
    lines: ['RL', 'BL', 'GL', 'OL'],
    icon: faArrowsLeftRightToLine,
    section: 'single',
    sub: true,
  },
  sdTraveltimes: {
    key: 'sdTraveltimes',
    path: '/singleday/traveltimes',
    name: 'Travel Times',
    lines: ['RL', 'BL', 'GL', 'OL'],
    icon: faClock,
    section: 'single',
    sub: true,
  },
  sdDwells: {
    key: 'sdDwells',
    path: '/singleday/dwells',
    name: 'Dwells',
    lines: ['RL', 'BL', 'GL', 'OL'],
    icon: faHourglass,
    section: 'single',
    sub: true,
  },
  range: {
    key: 'range',
    path: '/range',
    name: 'Range',
    lines: ['RL', 'BL', 'GL', 'OL', 'BUS'],
    section: 'range',
    icon: faCalendarWeek,
  },
  rangeHeadways: {
    key: 'rangeHeadways',
    path: '/range/headways',
    name: 'Headways',
    lines: ['RL', 'BL', 'GL', 'OL'],
    icon: faArrowsLeftRightToLine,
    section: 'range',
    sub: true,
  },
  rangeTraveltimes: {
    key: 'rangeTraveltimes',
    path: '/range/traveltimes',
    name: 'Travel Times',
    lines: ['RL', 'BL', 'GL', 'OL'],
    icon: faClock,
    section: 'range',
    sub: true,
  },
  rangeDwells: {
    key: 'rangeDwells',
    path: '/range/dwells',
    name: 'Dwells',
    lines: ['RL', 'BL', 'GL', 'OL'],
    icon: faHourglass,
    section: 'range',
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

export const TRIP_PAGES = [
  ALL_PAGES.singleday,
  ALL_PAGES.sdTraveltimes,
  ALL_PAGES.sdHeadways,
  ALL_PAGES.sdDwells,
  ALL_PAGES.range,
  ALL_PAGES.rangeTraveltimes,
  ALL_PAGES.rangeHeadways,
  ALL_PAGES.rangeDwells,
];

export const TODAY = [ALL_PAGES.today];

export const LINE_PAGES = [
  ALL_PAGES.overview,
  ALL_PAGES.speed,
  ALL_PAGES.service,
  ALL_PAGES.slowzones,
  ALL_PAGES.headways,
  ALL_PAGES.ridership,
];

export const PATH_TO_PAGE_MAP: { [key in Page]: string } = {
  today: 'today',
  overview: 'overview',
  singleday: 'singleday',
  sdHeadways: 'sdHeadways',
  sdTraveltimes: 'sdTraveltimes',
  sdDwells: 'sdDwells',
  rangeHeadways: 'rangeHeadways',
  rangeTraveltimes: 'rangeTraveltimes',
  rangeDwells: 'rangeDwells',
  range: 'range',
  speed: 'speed',
  service: 'service',
  slowzones: 'slowzones',
  headways: 'headways',
  ridership: 'ridership',
};

// TODO: type this
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
