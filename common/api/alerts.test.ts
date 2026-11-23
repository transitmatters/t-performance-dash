import { afterEach, describe, expect, it, vi } from 'vitest';

import { AlertEffect } from '../types/alerts';
import { fetchAlerts, fetchHistoricalAlerts, getHistoricalAlertRoutes } from './alerts';

const respond = (body: unknown) => {
  vi.stubGlobal('window', { location: { origin: 'https://dashboard.transitmatters.org' } });
  return vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status: 200 }));
};

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

describe('fetchAlerts', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('reads an effect it does not know as UNKNOWN_EFFECT, and stop IDs as strings', async () => {
    vi.stubGlobal(
      'fetch',
      respond([
        {
          id: '1',
          type: 'SOME_NEW_EFFECT',
          header: 'Something new',
          active_period: [{ start: '2026-11-01T00:00:00', current: true, upcoming: false }],
          stops: [70061, 'place-alfcl'],
          routes: null,
        },
      ])
    );
    const [alert] = await fetchAlerts('Red');
    expect(alert).toMatchObject({
      type: AlertEffect.UNKNOWN_EFFECT,
      stops: ['70061', 'place-alfcl'],
      routes: undefined,
    });
  });
});

describe('fetchHistoricalAlerts', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('reads a day with no archive as no alerts', async () => {
    vi.stubGlobal('fetch', respond(null));
    expect(await fetchHistoricalAlerts('2016-01-01', 'Red')).toEqual([]);
  });

  it('fills in missing text and end as null', async () => {
    vi.stubGlobal('fetch', respond([{ valid_from: '2026-11-01T00:00:00' }]));
    expect(await fetchHistoricalAlerts('2026-11-01', 'Red')).toEqual([
      { valid_from: '2026-11-01T00:00:00', valid_to: null, text: null },
    ]);
  });
});
