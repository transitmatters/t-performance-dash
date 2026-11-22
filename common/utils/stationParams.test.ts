import { describe, expect, it } from 'vitest';
import { withCanonicalStations } from './stationParams';

const TRIPS = '/red/trips/single/';

describe('withCanonicalStations', () => {
  it('leaves pages without stations alone', () => {
    expect(withCanonicalStations('/red/speed/', { from: 'nope' })).toEqual({ from: 'nope' });
    expect(withCanonicalStations('/system/slowzones/', {})).toEqual({});
  });

  it('fills in the route defaults on a first visit', () => {
    const { from, to } = withCanonicalStations(TRIPS, { date: '2026-01-05' });
    expect(from).toBeTypeOf('string');
    expect(to).toBeTypeOf('string');
    expect(from).not.toBe(to);
  });

  it('keeps a valid trip as it is', () => {
    const search = { date: '2026-01-05', from: '70063', to: '70065' };
    expect(withCanonicalStations(TRIPS, search)).toEqual(search);
  });

  it("uses the direction's stop ids", () => {
    // Davis to Porter runs in direction 1; 70064 is Davis's direction 0 platform.
    expect(withCanonicalStations(TRIPS, { from: '70064', to: '70065' })).toEqual({
      from: '70063',
      to: '70065',
    });
  });

  it('moves a trip from a station to itself one stop along', () => {
    expect(withCanonicalStations(TRIPS, { from: '70063', to: '70064' })).toEqual({
      from: '70063',
      to: '70065',
    });
  });

  it("replaces another line's stops with this line's defaults", () => {
    const defaults = withCanonicalStations(TRIPS, {});
    // 70036 is Oak Grove, on the Orange Line.
    expect(withCanonicalStations(TRIPS, { from: '70036', to: '70065' }).from).toBe(defaults.from);
  });
});
