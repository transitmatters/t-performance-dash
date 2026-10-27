import { describe, expect, it } from 'vitest';
import { BUS_ROUTES } from '../types/lines';
import { getPokeySchleppiePlacements, POKEY_SCHLEPPIE_AWARDS } from './pokeySchleppie';

describe('POKEY_SCHLEPPIE_AWARDS', () => {
  it('only lists routes the dashboard has a page for', () => {
    const routeNames = new Set(BUS_ROUTES.flatMap((busRoute) => busRoute.split('/')));
    for (const { pokey, schleppie } of Object.values(POKEY_SCHLEPPIE_AWARDS)) {
      for (const route of [...pokey, ...schleppie].flatMap((name) => name.split('/'))) {
        expect(routeNames).toContain(route);
      }
    }
  });
});

describe('getPokeySchleppiePlacements', () => {
  it('finds every placement for a single route, oldest year first', () => {
    expect(getPokeySchleppiePlacements('1')).toEqual([
      { year: 2024, award: 'pokey', route: '1', rank: 1 },
      { year: 2024, award: 'schleppie', route: '1', rank: 1 },
      { year: 2025, award: 'pokey', route: '1', rank: 1 },
      { year: 2025, award: 'schleppie', route: '1', rank: 3 },
      { year: 2026, award: 'pokey', route: '1', rank: 2 },
      { year: 2026, award: 'schleppie', route: '1', rank: 3 },
    ]);
  });

  it('does not match routes that only share a prefix', () => {
    expect(getPokeySchleppiePlacements('10')).toEqual([
      { year: 2025, award: 'pokey', route: '10', rank: 9 },
      { year: 2026, award: 'pokey', route: '10', rank: 10 },
    ]);
  });

  it('matches a route inside a combined route', () => {
    expect(getPokeySchleppiePlacements('17/19')).toEqual([
      { year: 2025, award: 'pokey', route: '19', rank: 4 },
      { year: 2026, award: 'pokey', route: '19', rank: 9 },
    ]);
    expect(getPokeySchleppiePlacements('CT3/171')).toEqual([
      { year: 2025, award: 'pokey', route: 'CT3', rank: 2 },
      { year: 2026, award: 'pokey', route: 'CT3', rank: 5 },
    ]);
  });

  it('shows a route on both its own page and its combined page', () => {
    const expected = [{ year: 2026, award: 'schleppie', route: '116', rank: 2 }];
    expect(getPokeySchleppiePlacements('116')).toEqual(expected);
    expect(getPokeySchleppiePlacements('114/116/117')).toEqual(expected);
  });

  it('keeps separate placements for each route in a combined route', () => {
    expect(getPokeySchleppiePlacements('SL4/SL5')).toEqual([
      { year: 2025, award: 'pokey', route: 'SL4/SL5', rank: 3 },
      { year: 2025, award: 'schleppie', route: 'SL4/SL5', rank: 6 },
      { year: 2026, award: 'pokey', route: 'SL4', rank: 1 },
      { year: 2026, award: 'pokey', route: 'SL5', rank: 8 },
    ]);
  });

  it('returns nothing for a route that never placed', () => {
    expect(getPokeySchleppiePlacements('7')).toEqual([]);
  });
});
