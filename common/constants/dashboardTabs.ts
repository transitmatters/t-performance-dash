export type Tab = 'Subway' | 'Bus' | 'System';

export const DASHBOARD_TABS: { [key in Tab]: { name: Tab; path: string; disabled?: boolean } } = {
  Subway: { name: 'Subway', path: '/red' },
  Bus: { name: 'Bus', path: '/bus/trips?busRoute=1' },
  System: { name: 'System', path: '/', disabled: true },
};
