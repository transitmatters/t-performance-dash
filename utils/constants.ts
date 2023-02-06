import { Line, LineMap } from '../common/types/stations';
import stations_json from './stations.json';

export const stations: { [key in Line]: LineMap } = stations_json;

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
