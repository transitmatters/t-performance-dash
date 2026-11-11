import { describe, expect, it } from 'vitest';

import { getHistoricalAlertRoutes } from './alerts';

describe('getHistoricalAlertRoutes', () => {
  it('asks for every Green Line branch', () => {
    expect(getHistoricalAlertRoutes('Green')).toEqual(['Green-B', 'Green-C', 'Green-D', 'Green-E']);
  });

  it('splits a combined bus route into its route IDs', () => {
    expect(getHistoricalAlertRoutes('Bus', '17/19')).toEqual(['17', '19']);
  });

  it('passes other lines and routes through', () => {
    expect(getHistoricalAlertRoutes('Red')).toEqual(['Red']);
    expect(getHistoricalAlertRoutes('Commuter Rail', undefined, 'CR-Fairmount')).toEqual([
      'CR-Fairmount',
    ]);
  });
});
