import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import {
  faHouse,
  faTrainSubway,
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
  | 'ntt'
  | 'singleday'
  | 'range';
export enum PAGES {
  today = 'today',
  overview = 'overview',
  speed = 'speed',
  service = 'service',
  slowzones = 'slowzones',
  headways = 'headways',
  ridership = 'ridership',
  ntt = 'ntt',
  singleday = 'singleday',
  range = 'range',
}

type Section = 'today' | 'single' | 'range' | 'line' | 'ntt';

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
  range: {
    key: 'range',
    path: '/range',
    name: 'Range',
    lines: ['RL', 'BL', 'GL', 'OL', 'BUS'],
    section: 'range',
    icon: faCalendarWeek,
  },
  overview: {
    key: 'overview',
    path: '/overview',
    name: 'Overview',
    lines: ['RL', 'BL', 'GL', 'OL'],
    section: 'line',
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
    lines: ['RL', 'BL', 'GL', 'OL'],
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
  ntt: {
    key: 'ntt',
    path: '/newtrains',
    name: 'New Train Tracker',
    icon: faTrainSubway,
    section: 'ntt',
    lines: [],
  },
};

export const TRIP_PAGES = [ALL_PAGES.singleday, ALL_PAGES.range];

export const TODAY = [ALL_PAGES.today];

export const LINE_PAGES = [
  ALL_PAGES.overview,
  ALL_PAGES.speed,
  ALL_PAGES.service,
  ALL_PAGES.slowzones,
  ALL_PAGES.headways,
  ALL_PAGES.ridership,
];
export const MORE_PAGES = [ALL_PAGES.ntt];

export const PATH_TO_PAGE_MAP: { [key in Page]: string } = {
  today: 'today',
  overview: 'overview',
  singleday: 'singleday',
  range: 'range',
  speed: 'speed',
  service: 'service',
  slowzones: 'slowzones',
  headways: 'headways',
  ridership: 'ridership',
  ntt: 'ntt',
};
