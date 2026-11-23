import { describe, expect, it } from 'vitest';
import { FERRY_DEFAULTS } from '../../common/state/defaults/dateDefaults';
import type { Line } from '../../common/types/lines';
import type { QueryParams, Route } from '../../common/types/router';
import { getCanonicalSearchHref } from '../../common/utils/dateParams';
import { parseSearch } from '../../common/utils/searchParams';
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
      `/ferry/trips/single?date=${FERRY_DEFAULTS.singleTripConfig.date}&ferryRoute=Boat-F6`
    );
  });

  it("opens ferry trips on the ferry's own dates, which another mode's can fall in a gap of", () => {
    // Between the MBTA's ferry archive (to Mar 31, 2026) and our own recording (from Oct 2).
    const inGap = { date: '2026-06-15', from: '70061', to: '70063' };
    expect(hrefForLine('line-ferry', at('line-red', 'singleTrips', inGap))).toBe(
      `/ferry/trips/single?date=${FERRY_DEFAULTS.singleTripConfig.date}&ferryRoute=Boat-F6`
    );
    const { startDate, endDate } = FERRY_DEFAULTS.multiTripConfig;
    const range = { startDate: '2026-06-01', endDate: '2026-06-30', ttDays: 'weekday' };
    expect(hrefForLine('line-ferry', at('line-red', 'multiTrips', range))).toBe(
      `/ferry/trips/multi?ttDays=weekday&startDate=${startDate}&endDate=${endDate}&ferryRoute=Boat-F6`
    );
  });

  it("leaves dates outside the new mode's data for the date bounds to clamp on arrival", () => {
    const from2016 = { startDate: '2016-01-04', endDate: '2016-06-27' };
    const href = hrefForLine('line-commuter-rail', at('line-red', 'ridership', from2016));
    const [pathname, search] = href.split('?');
    const arrived = getCanonicalSearchHref(pathname, parseSearch(`?${search}`));
    // Commuter Rail ridership starts Jun 22, 2022.
    expect(parseSearch(`?${arrived?.split('?')[1]}`)).toMatchObject({
      startDate: '2022-06-22',
      crRoute: 'CR-Fairmount',
    });
  });

  it('leaves subway-only filters behind, but keeps the delay cause in focus', () => {
    const greenDelays = { ...RANGE, branch: 'C', focus: 'disabled_vehicle' };
    expect(hrefForLine('line-bus', at('line-green', 'delays', greenDelays))).toBe(
      `/bus/delays?${DATES}&focus=disabled_vehicle&busRoute=1`
    );
    expect(hrefForLine('line-bus', at('line-red', 'reliability', { ...RANGE, relDir: '1' }))).toBe(
      `/bus/reliability?${DATES}&busRoute=1`
    );
  });

  it("leaves the old line's route and branch behind", () => {
    const busFleet: QueryParams = { ...RANGE, busRoute: 'SL4/SL5', routeId: 'SL4' };
    expect(hrefForLine('line-commuter-rail', at('line-bus', 'fleet', busFleet))).toBe(
      `/commuter-rail/fleet?${DATES}&crRoute=CR-Fairmount`
    );
    const crFleet: QueryParams = { ...RANGE, crRoute: 'CR-Lowell' };
    expect(hrefForLine('line-bus', at('line-commuter-rail', 'fleet', crFleet))).toBe(
      `/bus/fleet?${DATES}&busRoute=1`
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
    const busRidership: QueryParams = { ...RANGE, busRoute: 'SL4/SL5', routeId: 'SL4' };
    expect(hrefForLine('line-RIDE', at('line-bus', 'ridership', busRidership))).toBe(
      `/the-ride/ridership?${DATES}`
    );
    expect(hrefForLine('line-RIDE', at('line-red', 'reliability', { ...RANGE, relDir: '1' }))).toBe(
      `/the-ride/reliability?${DATES}`
    );
    expect(hrefForLine('line-RIDE', at('line-red', 'speed', RANGE))).toBe('/the-ride/ridership/');
  });
});
