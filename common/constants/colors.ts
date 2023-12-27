import { hexWithAlpha } from '../utils/general';

export const COLORS = {
  mbta: {
    red: '#D13434',
    orange: '#ed8b00',
    blue: '#003da5',
    green: '#00834d',
    bus: '#FFC72C',
    commuterRail: '#80276c',
  },
  charts: {
    fillBackgroundColor: '#bfc8d680',
    fillBackgroundColorHourly: '#88aee680',
    pointBackgroundColor: '#1c1c1c',
    pointColor: '#1c1c1c',
  },
  tm: {
    red: '#a31e1e',
    grey: '#2e2d2c',
  },
  design: {
    darkGrey: '#353535',
    sideBar: '#403e3e',
    subtitleGrey: '#808080',
    lightGrey: '#DADADA',
    background: '#F6F6F6',
  },
};

// Colors for charts
export const CHART_COLORS = {
  GREY: '#1c1c1c',
  GREEN: '#64b96a',
  YELLOW: '#f5ed00',
  RED: '#c33149',
  PURPLE: '#bb5cc1',
  FILL: '#bfc8d680',
  FILL_HOURLY: '#88aee680',
  DARK_LINE: '#303030a0',
  ANNOTATIONS: hexWithAlpha('#202020', 0.4),
  BLOCKS: hexWithAlpha('#202020', 0.2),
  BLOCKS_SOLID: '#d2d2d2',
};

export const LINE_COLORS = {
  'line-red': COLORS.mbta.red,
  'line-orange': COLORS.mbta.orange,
  'line-blue': COLORS.mbta.blue,
  'line-green': COLORS.mbta.green,
  'line-bus': COLORS.mbta.bus,
  'line-commuter-rail': COLORS.mbta.commuterRail,
  default: '#303030',
};

export const LINE_COLORS_LEVELS = {
  'line-red': { 0: '#D13434', 1: '#d64949', 2: '#da5e5e', 3: '#df7272' },
  'line-orange': { 0: '#ed8b00', 1: '#ff9907', 2: '#ffa321', 3: '#ffae3b' },
  'line-blue': { 0: '#003da5', 1: '#0046bf', 2: '#0050d8', 3: '#0059f2' },
  'line-green': { 0: '#00834d', 1: '#009d5c', 2: '#00b66b', 3: '#00d07a' },
  'line-bus': { 0: '#ffc72c', 1: '#ffce46', 2: '#ffd55f', 3: '#ffdb79' },
  default: '#303030',
};
