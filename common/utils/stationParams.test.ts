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

  it('moves a trip from the last station to itself one stop back', () => {
    // 70038 and 70838 are both Bowdoin, the end of the Blue Line.
    const { from, to } = withCanonicalStations('/blue/trips/single/', {
      from: '70038',
      to: '70838',
    });
    expect(from).toBe('70038');
    expect(to).toBeTypeOf('string');
    expect(to).not.toBe('70038');
  });

  describe('with only one stop given', () => {
    const BUS = '/bus/trips/single/';

    it("picks an end that runs in the given stop's direction", () => {
      // Copley only has a direction 1 stop on the 39, and the default end is behind it.
      expect(withCanonicalStations(BUS, { busRoute: '39', from: '39-1-175' })).toMatchObject({
        from: '39-1-175',
        to: '39-1-23391',
      });
      // Winship St only has a direction 0 stop on the 65.
      expect(withCanonicalStations(BUS, { busRoute: '65', to: '65-0-1994' })).toMatchObject({
        from: '65-0-1026',
        to: '65-0-1994',
      });
    });

    it('falls back to the defaults when nothing runs from the given stop', () => {
      // Sullivan is where the 101 ends in direction 1, so no trip starts there.
      const defaults = withCanonicalStations(BUS, { busRoute: '101' });
      expect(withCanonicalStations(BUS, { busRoute: '101', from: '101-1-29001' })).toEqual(
        defaults
      );
      expect(withCanonicalStations(BUS, { busRoute: '86', from: '86-0-2074' }).to).toBeTypeOf(
        'string'
      );
    });
  });

  it("replaces another line's stops with this line's defaults", () => {
    const defaults = withCanonicalStations(TRIPS, {});
    // 70036 is Oak Grove, on the Orange Line.
    expect(withCanonicalStations(TRIPS, { from: '70036', to: '70065' }).from).toBe(defaults.from);
  });
});
