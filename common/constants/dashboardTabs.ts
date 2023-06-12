import { BUS_DEFAULTS } from '../state/defaults/dateDefaults';
import type { QueryParams } from '../types/router';

export type Tab = 'Subway' | 'Bus' | 'System';

export const DASHBOARD_TABS: {
  [key in Tab]: { name: Tab; path: string; disabled?: boolean; query?: QueryParams };
} = {
  System: { name: 'System', path: '/system' },
  Subway: { name: 'Subway', path: '/red' },
  Bus: {
    name: 'Bus',
    path: '/bus/trips',
    query: { busRoute: '1', queryType: 'single', startDate: BUS_DEFAULTS.tripConfig.startDate },
  },
};
