export type Tab = 'Subway' | 'Bus' | 'System';

export const DASHBOARD_TABS: { [key in Tab]: { name: Tab; path: string } } = {
  Subway: { name: 'Subway', path: '/red' },
  Bus: { name: 'Bus', path: '/bus/singleday?busRoute=1' },
  System: { name: 'System', path: '/' },
};
