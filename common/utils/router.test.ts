import { describe, expect, it } from 'vitest';
import type { Route } from '../types/router';
import { ALL_PAGES } from '../constants/pages';
import { useDateStore } from '../state/dateStore';
import type { StationStore } from '../state/stationStore';
import {
  getBusRouteSelectionItemHref,
  getLineSelectionItemHref,
  getQueryParams,
  parseRoutePath,
  stationScope,
  stripForeignRouteParams,
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

describe('getLineSelectionItemHref', () => {
  it('leaves the route param behind when switching lines', () => {
    const ferryRoute: Route = {
      line: 'line-ferry',
      linePath: 'ferry',
      lineShort: 'Ferry',
      page: 'singleTrips',
      tab: 'Ferry',
      query: { ferryRoute: 'Boat-F1', date: '2025-01-01', from: 'a', to: 'b' },
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
