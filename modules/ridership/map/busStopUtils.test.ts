import { describe, expect, it } from 'vitest';
import type { BusStopRidership } from '../../../common/types/dataPoints';
import {
  abbreviateBusStopName,
  getBusStopRidershipRouteIds,
  getStopComparisons,
  resolveBusStopRidershipSelection,
} from './busStopUtils';

const stop = (stop_id: string, boardings: number) => ({ stop_id, boardings, alightings: 0 });

const route28: BusStopRidership = {
  route_id: '28',
  seasons: [
    {
      season: 'Fall 2018',
      directions: [{ direction_id: 1, stops: [stop('a', 50)] }],
    },
    {
      season: 'Fall 2019',
      directions: [{ direction_id: 1, stops: [stop('a', 100), stop('b', 4)] }],
    },
    {
      season: 'Fall 2024',
      directions: [{ direction_id: 1, stops: [stop('a', 80), stop('b', 8)] }],
    },
    {
      season: 'Fall 2025',
      directions: [
        { direction_id: 0, stops: [stop('c', 10)] },
        { direction_id: 1, stops: [stop('a', 90), stop('b', 9)] },
      ],
    },
  ],
  stop_names: {},
};

const route34E: BusStopRidership = { route_id: '34E', seasons: [], stop_names: {} };

describe('getBusStopRidershipRouteIds', () => {
  it('splits combined routes into GTFS route IDs', () => {
    expect(getBusStopRidershipRouteIds('SL4/SL5')).toEqual(['751', '749']);
    expect(getBusStopRidershipRouteIds('17/19')).toEqual(['17', '19']);
  });

  it('adds the IDs the MBTA counts some routes under', () => {
    expect(getBusStopRidershipRouteIds('34')).toEqual(['34', '34E']);
    expect(getBusStopRidershipRouteIds('CT2')).toEqual(['747']);
  });
});

describe('resolveBusStopRidershipSelection', () => {
  it('defaults to the first route with data, its latest season and inbound', () => {
    const view = resolveBusStopRidershipSelection([route34E, route28], {});
    expect(view?.route.route_id).toBe('28');
    expect(view?.routesWithData.map((route) => route.route_id)).toEqual(['28']);
    expect(view?.season).toBe('Fall 2025');
    expect(view?.directionIds).toEqual([1, 0]);
    expect(view?.directionId).toBe(1);
    expect(view?.stops.map((s) => s.stop_id)).toEqual(['a', 'b']);
  });

  it('keeps a selection that exists and replaces one that does not', () => {
    expect(
      resolveBusStopRidershipSelection([route28], { season: 'Fall 2025', directionId: 0 })
        ?.directionId
    ).toBe(0);
    // Fall 2019 only ran inbound
    const view = resolveBusStopRidershipSelection([route28], {
      season: 'Fall 2019',
      directionId: 0,
    });
    expect(view?.season).toBe('Fall 2019');
    expect(view?.directionId).toBe(1);
    expect(
      resolveBusStopRidershipSelection([route28], { routeId: '34E', season: 'Fall 2030' })?.season
    ).toBe('Fall 2025');
  });

  it('is null when no route has data', () => {
    expect(resolveBusStopRidershipSelection([route34E], {})).toBeNull();
  });
});

describe('getStopComparisons', () => {
  it('compares with the previous season and Fall 2019', () => {
    expect(getStopComparisons(route28, 'Fall 2025', 1, 'a')).toEqual([
      { season: 'Fall 2024', boardings: 80, change: expect.closeTo(0.125) },
      { season: 'Fall 2019', boardings: 100, change: expect.closeTo(-0.1) },
    ]);
  });

  it('leaves out the change from a season with only a few riders', () => {
    expect(getStopComparisons(route28, 'Fall 2025', 1, 'b')).toEqual([
      { season: 'Fall 2024', boardings: 8, change: undefined },
      { season: 'Fall 2019', boardings: 4, change: undefined },
    ]);
  });

  it('only lists Fall 2019 once, and not for earlier seasons', () => {
    expect(
      getStopComparisons(route28, 'Fall 2024', 1, 'a').map((comparison) => comparison.season)
    ).toEqual(['Fall 2019']);
    expect(
      getStopComparisons(route28, 'Fall 2019', 1, 'a').map((comparison) => comparison.season)
    ).toEqual(['Fall 2018']);
    expect(getStopComparisons(route28, 'Fall 2018', 1, 'a')).toEqual([]);
  });

  it('skips seasons where the stop was not served', () => {
    expect(getStopComparisons(route28, 'Fall 2025', 0, 'c')).toEqual([]);
  });
});

describe('abbreviateBusStopName', () => {
  it('shortens long names for the map', () => {
    expect(abbreviateBusStopName({ stationName: 'Massachusetts Ave @ Holyoke St' })).toBe(
      'Mass Ave @ Holyoke St'
    );
    expect(abbreviateBusStopName({ stationName: 'Mattapan Station' })).toBe('Mattapan');
    expect(
      abbreviateBusStopName({ stationName: 'Massachusetts Ave @ Massachusetts Ave Station' })
    ).toBe('Mass Ave @ Mass Ave');
  });
});
