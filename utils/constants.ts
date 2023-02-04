import { LineShort } from '../types/lines';
import { LineMap } from '../types/stations';

import stations_json from './stations.json';
import bus_1 from './bus_constants/1.json';
import bus_15 from './bus_constants/15.json';
import bus_22 from './bus_constants/22.json';
import bus_23 from './bus_constants/23.json';
import bus_28 from './bus_constants/28.json';
import bus_32 from './bus_constants/32.json';
import bus_39 from './bus_constants/39.json';
import bus_57 from './bus_constants/57.json';
import bus_66 from './bus_constants/66.json';
import bus_71 from './bus_constants/71.json';
import bus_73 from './bus_constants/73.json';
import bus_77 from './bus_constants/77.json';
import bus_111 from './bus_constants/111.json';
import bus_114_116_117 from './bus_constants/114-116-117.json';

export const rtStations: { [key in Exclude<LineShort, 'Bus'>]: LineMap } = stations_json;

export const busStations: { [key: string]: LineMap } = {
  ...bus_1,
  ...bus_15,
  ...bus_22,
  ...bus_23,
  ...bus_28,
  ...bus_32,
  ...bus_39,
  ...bus_57,
  ...bus_66,
  ...bus_71,
  ...bus_73,
  ...bus_77,
  ...bus_111,
  ...bus_114_116_117,
};

export const stations = { ...rtStations, BUS: busStations };

// Colors for charts
export const CHART_COLORS = {
  GREY: '#1c1c1c',
  GREEN: '#64b96a',
  YELLOW: '#f5ed00',
  RED: '#c33149',
  PURPLE: '#bb5cc1',
  FILL: '#bfc8d680',
  FILL_HOURLY: '#88aee680',
};

export const LINE_COLORS = {
  RED: '#da291c',
  ORANGE: '#ed8b00',
  BLUE: '#003da5',
  GREEN: '#00834d',
  BUS: '#ffc72c',
};

export const colorsForLine: Record<string, string> = {
  red: LINE_COLORS.RED,
  orange: LINE_COLORS.ORANGE,
  blue: LINE_COLORS.BLUE,
  green: LINE_COLORS.GREEN,
  bus: LINE_COLORS.BUS,
};

export const PRODUCTION = 'dashboard-v4.transitmatters.org';
export const BETA = 'dashboard-v4-beta.labs.transitmatters.org';
const FRONTEND_TO_BACKEND_MAP = {
  PRODUCTION: 'https://dashboard-v4-api.transitmatters.org',
  BETA: 'https://dashboard-v4-beta-api.labs.transitmatters.org',
};
let index = '';
// This is to prevent a next js render error https://nextjs.org/docs/messages/prerender-error
if (typeof window !== 'undefined') {
  index = window.location.hostname;
}
export const APP_DATA_BASE_PATH = FRONTEND_TO_BACKEND_MAP[index];
