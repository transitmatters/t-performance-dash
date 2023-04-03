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

export type NavTab = {
  key: string;
  path: string;
  name: string;
  lines: Line[];
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
  },
  singleday: {
    key: 'singleday',
    path: '/singleday',
    name: 'Single Day',
    lines: ['RL', 'BL', 'GL', 'OL', 'BUS'],
  },
  range: { key: 'range', path: '/range', name: 'Range', lines: ['RL', 'BL', 'GL', 'OL', 'BUS'] },
  overview: {
    key: 'overview',
    path: '/overview',
    name: 'Overview',
    lines: ['RL', 'BL', 'GL', 'OL'],
  },
  speed: { key: 'speed', path: '/speed', name: 'Speed', lines: [], sub: true },
  service: { key: 'service', path: '/service', name: 'Service', lines: [], sub: true },
  slowzones: {
    key: 'slowzones',
    path: '/slowzones',
    name: 'Slow Zones',
    lines: ['RL', 'BL', 'OL'],
    sub: true,
  },
  headways: {
    key: 'headways',
    path: '/headways',
    name: 'Headways',
    lines: ['RL', 'BL', 'GL', 'OL'],
    sub: true,
  },
  ridership: {
    key: 'ridership',
    path: '/ridership',
    name: 'Ridership',
    lines: ['RL', 'BL', 'GL', 'OL', 'BUS'],
    sub: true,
  },
  ntt: {
    key: 'ntt',
    path: '/newtrains',
    name: 'New Train Tracker',
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
