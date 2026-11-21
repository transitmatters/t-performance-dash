import { describe, expect, it } from 'vitest';
import type { Line } from '../../common/types/lines';
import type { QueryParams, Route } from '../../common/types/router';
import { hrefForLine } from './lineNav';

const at = (line: Line | undefined, page: string, query: QueryParams = {}) =>
  ({ line, page, query }) as Route;

const RANGE = { startDate: '2026-01-01', endDate: '2026-02-01' };
const DATES = 'startDate=2026-01-01&endDate=2026-02-01';

describe('hrefForLine', () => {
  it('keeps the page when the new mode has it, on its default route', () => {
    expect(hrefForLine('line-commuter-rail', at('line-red', 'fleet', RANGE))).toBe(
      `/commuter-rail/fleet?${DATES}&crRoute=CR-Fairmount`
    );
    expect(hrefForLine('line-bus', at('line-red', 'speed', RANGE))).toBe(
      `/bus/speed?${DATES}&busRoute=1`
    );
    const trip = { date: '2026-01-05', from: '70061', to: '70063' };
    expect(hrefForLine('line-ferry', at('line-red', 'singleTrips', trip))).toBe(
      '/ferry/trips/single?date=2026-01-05&ferryRoute=Boat-F6'
    );
  });

  it("leaves the old line's route, branch and Overview preset behind", () => {
    const busFleet: QueryParams = { ...RANGE, busRoute: 'SL4/SL5', routeId: 'SL4' };
    expect(hrefForLine('line-commuter-rail', at('line-bus', 'fleet', busFleet))).toBe(
      `/commuter-rail/fleet?${DATES}&crRoute=CR-Fairmount`
    );
    const crFleet: QueryParams = { ...RANGE, crRoute: 'CR-Lowell' };
    expect(hrefForLine('line-bus', at('line-commuter-rail', 'fleet', crFleet))).toBe(
      `/bus/fleet?${DATES}&busRoute=1`
    );
    expect(hrefForLine('line-bus', at('line-red', 'overview', { view: 'month' }))).toBe(
      '/bus/?busRoute=1'
    );
  });

  it("opens the mode's entry page when it doesn't have the current page", () => {
    expect(hrefForLine('line-commuter-rail', at('line-bus', 'speedmap', { busRoute: '1' }))).toBe(
      '/commuter-rail/?crRoute=CR-Fairmount'
    );
    expect(hrefForLine('line-ferry', at('line-red', 'speed', RANGE))).toMatch(
      /^\/ferry\/trips\/single\/\?ferryRoute=Boat-F6&date=/
    );
    expect(hrefForLine('line-bus', at(undefined, 'landing'))).toBe('/bus/?busRoute=1');
  });

  it("opens the current line's entry page from its own link", () => {
    expect(hrefForLine('line-bus', at('line-bus', 'speed', { ...RANGE, busRoute: '77' }))).toBe(
      '/bus/?busRoute=1'
    );
  });

  it('keeps the page on The RIDE too', () => {
    expect(hrefForLine('line-RIDE', at('line-red', 'reliability', RANGE))).toBe(
      `/the-ride/reliability?${DATES}`
    );
    expect(hrefForLine('line-RIDE', at('line-red', 'speed', RANGE))).toBe('/the-ride/ridership/');
  });
});
