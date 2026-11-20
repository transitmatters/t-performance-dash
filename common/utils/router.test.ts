import { describe, expect, it } from 'vitest';
import type { Route } from '../types/router';
import { ALL_PAGES } from '../constants/pages';
import { useDateStore } from '../state/dateStore';
import type { StationStore } from '../state/stationStore';
import {
  getBusRouteSelectionItemHref,
  getBusSpeedMapRouteHref,
  getLineSelectionItemHref,
  getNavTripPage,
  getQueryParams,
  parseRoutePath,
  stationScope,
  stripForeignRouteParams,
  withDefaultRouteParam,
} from './router';

describe('getQueryParams stations', () => {
  // Malden Center -> Wellington, remembered on the way out of Orange Line trips.
  const orangeStore: StationStore = {
    from: '70034',
    to: '70032',
    scope: stationScope('line-orange', {}),
    setStationStore: () => {},
  };
  const toTrips = (query: Route['query'], line: Route['line'], store = orangeStore) =>
    getQueryParams(
      ALL_PAGES.overview,
      ALL_PAGES.singleTrips,
      query,
      useDateStore.getState(),
      store,
      line
    );

  it('reuses remembered stations on the line they were picked on', () => {
    expect(toTrips({}, 'line-orange')).toMatchObject({ from: '70034', to: '70032' });
  });

  it('leaves remembered stations behind on another line or route', () => {
    expect(toTrips({ crRoute: 'CR-Fairmount' }, 'line-commuter-rail')).not.toHaveProperty('from');
    expect(toTrips({}, 'line-red')).not.toHaveProperty('from');

    const busStore = { ...orangeStore, scope: stationScope('line-bus', { busRoute: '1' }) };
    expect(toTrips({ busRoute: '1' }, 'line-bus', busStore)).toMatchObject({ from: '70034' });
    expect(toTrips({ busRoute: '28' }, 'line-bus', busStore)).not.toHaveProperty('from');
  });
});

describe('returning to trips', () => {
  it('keeps the open trip view and otherwise reopens the last one used', () => {
    expect(getNavTripPage('multiTrips', 'singleTrips')).toBe(ALL_PAGES.multiTrips);
    expect(getNavTripPage('singleTrips', 'multiTrips')).toBe(ALL_PAGES.singleTrips);
    expect(getNavTripPage('speed', 'multiTrips')).toBe(ALL_PAGES.multiTrips);
    expect(getNavTripPage('speed', 'singleTrips')).toBe(ALL_PAGES.singleTrips);
  });

  it('restores the saved range when coming back to the date range view', () => {
    const dateStore = {
      ...useDateStore.getState(),
      multiTripConfig: { startDate: '2026-03-01', endDate: '2026-03-31' },
    };
    const stationStore: StationStore = { setStationStore: () => {} };
    const query = getQueryParams(
      ALL_PAGES.speed,
      ALL_PAGES.multiTrips,
      { busRoute: '1', startDate: '2026-01-01', endDate: '2026-11-01' },
      dateStore,
      stationStore,
      'line-bus'
    );
    expect(query).toMatchObject({ startDate: '2026-03-01', endDate: '2026-03-31', busRoute: '1' });
  });
});

describe('parseRoutePath', () => {
  it('resolves each mode root to its overview', () => {
    expect(parseRoutePath('/red/').page).toBe('overview');
    expect(parseRoutePath('/bus/').page).toBe('overview');
    expect(parseRoutePath('/commuter-rail').page).toBe('overview');
  });
});

describe('stripForeignRouteParams', () => {
  it('drops route params from other modes', () => {
    expect(stripForeignRouteParams('/orange/', { busRoute: '1', view: 'year' })).toEqual({
      view: 'year',
    });
    expect(
      stripForeignRouteParams('/commuter-rail/', { crRoute: 'CR-Fairmount', busRoute: '1' })
    ).toEqual({ crRoute: 'CR-Fairmount' });
    expect(stripForeignRouteParams('/system/ridership/', { ferryRoute: 'Boat-F1' })).toEqual({});
    expect(stripForeignRouteParams('/', { crRoute: 'CR-Fairmount' })).toEqual({});
  });

  it("keeps the mode's own route param", () => {
    const search = { busRoute: '1', date: '2025-01-01' };
    expect(stripForeignRouteParams('/bus/trips/single/', search)).toEqual(search);
    expect(stripForeignRouteParams('/ferry/', { ferryRoute: 'Boat-F1' })).toEqual({
      ferryRoute: 'Boat-F1',
    });
  });
});

describe('withDefaultRouteParam', () => {
  it("fills in the mode's default route when the URL has none", () => {
    expect(withDefaultRouteParam('/bus/ridership/', {})).toEqual({ busRoute: '1' });
    expect(withDefaultRouteParam('/commuter-rail/delays/', { view: 'year' })).toEqual({
      view: 'year',
      crRoute: 'CR-Fairmount',
    });
    expect(withDefaultRouteParam('/ferry/ridership/', {})).toEqual({ ferryRoute: 'Boat-F6' });
    expect(withDefaultRouteParam('/embed/commuter-rail/delays/total/', {})).toEqual({
      crRoute: 'CR-Fairmount',
    });
  });

  it('keeps a route that is already there', () => {
    expect(withDefaultRouteParam('/bus/speed/', { busRoute: '22' })).toEqual({ busRoute: '22' });
    expect(withDefaultRouteParam('/commuter-rail/', { crRoute: 'CR-Worcester' })).toEqual({
      crRoute: 'CR-Worcester',
    });
  });

  it('replaces an unknown Commuter Rail or ferry route with the default', () => {
    expect(withDefaultRouteParam('/commuter-rail/', { crRoute: 'CR-Nope' })).toEqual({
      crRoute: 'CR-Fairmount',
    });
    expect(withDefaultRouteParam('/ferry/ridership/', { ferryRoute: 'Boat-Nope' })).toEqual({
      ferryRoute: 'Boat-F6',
    });
  });

  it('leaves bus routes alone, since bus pages take routes beyond the station files', () => {
    expect(withDefaultRouteParam('/bus/speedmap/', { busRoute: '9999' })).toEqual({
      busRoute: '9999',
    });
  });

  it('leaves the leaderboard and subway pages without one', () => {
    expect(withDefaultRouteParam('/bus/leaderboard/', {})).toEqual({});
    expect(withDefaultRouteParam('/red/ridership/', {})).toEqual({});
    expect(withDefaultRouteParam('/system/ridership/', {})).toEqual({});
  });
});

describe('getLineSelectionItemHref', () => {
  it('leaves the route param behind when switching lines', () => {
    const ferryRoute: Route = {
      line: 'line-ferry',
      linePath: 'ferry',
      lineShort: 'Ferry',
      page: 'singleTrips',
      tab: 'Ferry',
      query: { ferryRoute: 'Boat-F1', date: '2025-01-01', from: 'a', to: 'b' },
      colorKey: 'line-ferry',
      color: '',
    };
    expect(getLineSelectionItemHref('line-orange', ferryRoute)).toBe(
      '/orange/trips/single?date=2025-01-01'
    );
  });

  it("doesn't touch the query it's given, which is the router's own search object", () => {
    const query = Object.freeze({ ferryRoute: 'Boat-F1', date: '2025-01-01', from: 'a', to: 'b' });
    const route: Route = {
      line: 'line-ferry',
      linePath: 'ferry',
      lineShort: 'Ferry',
      page: 'singleTrips',
      tab: 'Ferry',
      query,
      colorKey: 'line-ferry',
      color: '',
    };
    expect(() => getLineSelectionItemHref('line-orange', route)).not.toThrow();
    expect(query).toEqual({ ferryRoute: 'Boat-F1', date: '2025-01-01', from: 'a', to: 'b' });
  });
});

describe('getBusRouteSelectionItemHref', () => {
  it('swaps the route and drops stations without mutating the query', () => {
    const query = Object.freeze({ busRoute: '1', date: '2025-01-01', from: 'a', to: 'b' });
    const route = {
      line: 'line-bus',
      linePath: 'bus',
      lineShort: 'Bus',
      page: 'singleTrips',
      tab: 'Bus',
      query,
      color: '',
    } as Route;
    expect(getBusRouteSelectionItemHref('77', route)).toBe(
      '/bus/trips/single?date=2025-01-01&busRoute=77'
    );
    expect(query.from).toBe('a');
  });
});

describe('bus speed map links', () => {
  const route = (page: string, query: Record<string, string>) =>
    ({
      line: 'line-bus',
      linePath: 'bus',
      lineShort: 'Bus',
      page,
      tab: 'Bus',
      query,
      color: '',
    }) as Route;

  it('drops the combined-route filter when switching routes', () => {
    const from = route('speedmap', { busRoute: 'SL4/SL5', routeId: 'SL4', band: 'pm_peak' });
    expect(getBusRouteSelectionItemHref('9', from)).toBe('/bus/speedmap?band=pm_peak&busRoute=9');
  });

  it('opens the route itself from Rankings, which has no per-route view', () => {
    const from = route('leaderboard', { date: '2026-11-05', rank: 'dropped' });
    expect(getBusRouteSelectionItemHref('28', from)).toBe('/bus/trips/single?busRoute=28');
  });

  it('opens the map on the period Rankings shows, without Rankings-only params', () => {
    const from = route('leaderboard', { date: '2026-11-05', rank: 'dropped', rankView: 'segment' });
    expect(getBusSpeedMapRouteHref('9', from, 'daily')).toBe(
      '/bus/speedmap?date=2026-11-05&busRoute=9&period=daily'
    );
    expect(getBusSpeedMapRouteHref('9', from, undefined)).toBe(
      '/bus/speedmap?date=2026-11-05&busRoute=9'
    );
  });
});
