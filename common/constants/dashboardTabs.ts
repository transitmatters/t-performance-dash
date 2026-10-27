import { FERRY_DEFAULTS } from '../state/defaults/dateDefaults';
import type { QueryParams, Tab } from '../types/router';

export const DASHBOARD_TABS: {
  [key in Tab]: { name: Tab; path: string; disabled?: boolean; query?: QueryParams };
} = {
  System: { name: 'System', path: '/system' },
  Subway: { name: 'Subway', path: '/red' },
  Bus: {
    name: 'Bus',
    path: '/bus',
    query: { busRoute: '1' },
  },
  'Commuter Rail': {
    name: 'Commuter Rail',
    path: '/commuter-rail',
    query: { crRoute: 'CR-Fairmount' },
  },
  Ferry: {
    name: 'Ferry',
    path: '/ferry/trips/single',
    query: { ferryRoute: 'Boat-F1', date: FERRY_DEFAULTS.singleTripConfig.date },
  },
  'The RIDE': {
    name: 'The RIDE',
    path: '/the-ride/ridership',
  },
};
