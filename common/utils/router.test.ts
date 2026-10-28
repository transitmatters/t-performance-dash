import { describe, expect, it } from 'vitest';
import type { Route } from '../types/router';
import { getLineSelectionItemHref, parseRoutePath, stripForeignRouteParams } from './router';

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
});
