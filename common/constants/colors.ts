import { hexWithAlpha } from '../utils/general';

export const COLORS = {
  mbta: {
    red: '#D13434',
    orange: '#ed8b00',
    blue: '#003da5',
    green: '#00834d',
    bus: '#FFC72C',
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
};

export const LINE_COLORS = {
  'line-red': '#D13434',
  'line-orange': '#ed8b00',
  'line-blue': '#003da5',
  'line-green': '#00834d',
  'line-bus': '#ffc72c',
  default: '#303030',
};

export const LINE_COLORS_LEVELS = {
  'line-red': { 0: '#D13434', 1: '#c02c2c', 2: '#ab2727', 3: '#962222' },
  'line-orange': { 0: '#ed8b00', 1: '#d47c00', 2: '#ba6d00', 3: '#a15e00' },
  'line-blue': { 0: '#003da5', 1: '#00348c', 2: '#002a72', 3: '#002159' },
  'line-green': { 0: '#00834d', 1: '#006a3e', 2: '#00502f', 3: '#003720' },
  'line-bus': { 0: '#ffc72c', 1: '#ffc013', 2: '#f8b600', 3: '#dfa300' },
  default: '#303030',
};
