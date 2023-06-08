import { BUS_DEFAULTS } from '../state/defaults/dashboardDefaults';
import type { QueryParams } from '../types/router';

export type Tab = 'Subway' | 'Bus' | 'System';

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
};
