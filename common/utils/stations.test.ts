import { describe, expect, it } from 'vitest';

import type { BusRoute, CommuterRailRoute, FerryRoute, LineShort } from '../types/lines';
import type { Station } from '../types/stations';
import {
  findValidDefaultStations,
  getLocationDetails,
  getStationForInvalidFromSelection,
  getStationInOptions,
  optionsStation,
  stopIdsForStations,
  stopNoun,
} from './stations';

describe('getStationInOptions', () => {
  const fairmount = optionsStation('Commuter Rail', undefined, 'CR-Fairmount');

  it("finds a stop among the line's own stations", () => {
    const station = fairmount?.[1];
    expect(getStationInOptions(station?.stops['0'][0], fairmount)).toBe(station);
  });

  it('rejects a stop from another line', () => {
    expect(getStationInOptions('70034', fairmount)).toBeUndefined();
    expect(getStationInOptions('70034', optionsStation('Orange'))?.stop_name).toBe('Malden Center');
  });

  it('treats a missing stop as unset', () => {
    expect(getStationInOptions(undefined, fairmount)).toBeUndefined();
  });
});

describe('stopNoun', () => {
  it('calls bus and ferry stops "stop"', () => {
    expect(stopNoun('Bus')).toBe('stop');
    expect(stopNoun('Ferry')).toBe('stop');
  });

  it('calls rail stops "station"', () => {
    expect(stopNoun('Red')).toBe('station');
    expect(stopNoun('Commuter Rail')).toBe('station');
    expect(stopNoun(undefined)).toBe('station');
  });
});

const busStations = (route: string) => optionsStation('Bus', route as BusRoute) as Station[];

const sharesBranch = (a: Station, b: Station) =>
  !a.branches || a.branches.some((branch) => b.branches?.includes(branch));

const hasTrip = (from: Station, to: Station) => {
  const { fromStopIds, toStopIds } = stopIdsForStations(from, to);
  return Boolean(fromStopIds?.length && toStopIds?.length) && sharesBranch(from, to);
};

describe('findValidDefaultStations', () => {
  it.each(['17/19', 'SL1/SL2/SL3/SLW', '104/109', '52/59', '24/27/33', '131/132'])(
    'picks two %s stops a trip runs between',
    (route) => {
      const { defaultFrom, defaultTo } = findValidDefaultStations(busStations(route));
      expect(defaultFrom && defaultTo && hasTrip(defaultFrom, defaultTo)).toBe(true);
    }
  );

  it("keeps a single route's second and third stops", () => {
    const stations = busStations('1');
    const { defaultFrom, defaultTo } = findValidDefaultStations(stations);
    expect(defaultFrom?.station).toBe(stations[1].station);
    expect(defaultTo?.station).toBe(stations[2].station);
  });
});

describe('getStationForInvalidFromSelection', () => {
  it.each(['52/59', '64/68', '424/450/456', '434/435/436', '505/553/554', '17/19'])(
    'ends a %s trip on a stop the new start shares a trip with',
    (route) => {
      const stations = busStations(route);
      const starts = stations.filter((station) => station.stops['1']?.length);
      const ends = starts.map((from) =>
        getStationForInvalidFromSelection('line-bus', from, stations)
      );
      expect(ends.filter(Boolean).length).toBeGreaterThan(0);
      starts.forEach((from, index) => {
        const to = ends[index];
        if (to) expect(hasTrip(from, to)).toBe(true);
      });
    }
  );

  it('meets at the trunk stop where branches share one', () => {
    const stations = busStations('17/19');
    const kane = stations.find((station) => station.station === 'kane')!;
    expect(getStationForInvalidFromSelection('line-bus', kane, stations)?.station).toBe('fldcr');
  });
});

type Routes = { bus?: BusRoute; cr?: CommuterRailRoute; ferry?: FerryRoute };

/** The direction label for a trip between two stops, looked up by name. */
const directionOf = (line: LineShort, from: string, to: string, routes: Routes = {}) => {
  const stations = optionsStation(line, routes.bus, routes.cr, routes.ferry);
  const find = (name: string) => stations?.find((station) => station.stop_name === name);
  return getLocationDetails(find(from), find(to)).direction;
};

describe('getLocationDetails direction', () => {
  it('names subway directions as each line does', () => {
    expect(directionOf('Red', 'Park Street', 'Ashmont')).toBe('southbound');
    expect(directionOf('Red', 'Park Street', 'Alewife')).toBe('northbound');
    expect(directionOf('Green', 'Park Street', 'Heath Street')).toBe('westbound');
    expect(directionOf('Green', 'Kenmore', 'Park Street')).toBe('eastbound');
  });

  it('names bus, Commuter Rail and ferry trips inbound or outbound', () => {
    expect(directionOf('Bus', 'Harvard', 'Nubian Station', { bus: '1' })).toBe('inbound');
    expect(directionOf('Bus', 'Nubian Station', 'Harvard', { bus: '1' })).toBe('outbound');
    expect(directionOf('Commuter Rail', 'Lowell', 'North Station', { cr: 'CR-Lowell' })).toBe(
      'inbound'
    );
    expect(
      directionOf('Ferry', 'Central Wharf (South)', 'Charlestown Navy Yard', { ferry: 'Boat-F4' })
    ).toBe('outbound');
  });
});
