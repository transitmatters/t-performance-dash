import { describe, expect, it } from 'vitest';
import { getHistoricalAlertRoutes } from '../api/alerts';
import type { BusRoute } from '../types/lines';
import { getBusRoutes } from './stations';
import { getBusRouteDataIds } from './lines';

const LEGACY_ROUTES = getBusRoutes().filter((busRoute) =>
  busRoute.endsWith('-legacy')
) as BusRoute[];

// getBusRouteIds keeps a retired route's "-legacy" label, which the API reads as a route_id of its
// own. These files use the label on purpose; anything that fetches a route's data must not.
const LABEL_USERS = [
  'common/constants/lines.ts',
  'common/utils/stations.ts',
  'modules/overview/BusReliabilityChart.tsx',
];

const sources = import.meta.glob<string>(
  ['/common/**/*.{ts,tsx}', '/modules/**/*.{ts,tsx}', '/routes/**/*.{ts,tsx}', '!**/*.test.ts'],
  { query: '?raw', import: 'default', eager: true }
);

describe('retired "-legacy" bus routes', () => {
  it('are fetched by the route_ids their data is filed under', () => {
    expect(LEGACY_ROUTES.length).toBeGreaterThan(0);
    for (const busRoute of LEGACY_ROUTES) {
      expect(getBusRouteDataIds(busRoute).join(',')).not.toContain('legacy');
      expect(getHistoricalAlertRoutes('Bus', busRoute).join(',')).not.toContain('legacy');
    }
  });

  it('are never fetched by their label', () => {
    const labelUsers = Object.entries(sources)
      .filter(([, source]) => source.includes('getBusRouteIds('))
      .map(([path]) => path.slice(1));
    expect(labelUsers.toSorted()).toEqual([...LABEL_USERS].toSorted());
  });
});
