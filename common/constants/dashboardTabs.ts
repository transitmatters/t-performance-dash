import { BUS_DEFAULTS, COMMUTER_RAIL_DEFAULTS } from '../state/defaults/dateDefaults';
import type { QueryParams, Tab } from '../types/router';

export const DASHBOARD_TABS: {
  [key in Tab]: { name: Tab; path: string; disabled?: boolean; query?: QueryParams };
} = {
  System: { name: 'System', path: '/system' },
  Subway: { name: 'Subway', path: '/red' },
  Bus: {
    name: 'Bus',
    path: '/bus/trips/single',
    query: { busRoute: '1', date: BUS_DEFAULTS.singleTripConfig.date },
  },
  'Commuter Rail': {
    name: 'Commuter Rail',
    path: '/commuter-rail',
    query: { crRoute: 'CR-Fairmount', date: COMMUTER_RAIL_DEFAULTS.singleTripConfig.date },
  },
};
