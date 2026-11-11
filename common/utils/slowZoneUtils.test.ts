import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { describe, expect, it } from 'vitest';
import type { LineShort } from '../types/lines';
import type { SlowZoneResponse } from '../types/dataPoints';
import {
  filterAllSlow,
  formatSegments,
  getStationPairName,
  getTripSlowZoneSummary,
  getWorstSlowZoneSegment,
  isZoneOnTrip,
} from './slowZoneUtils';
import { getParentStationForStopId } from './stations';

const zone = (
  color: SlowZoneResponse['color'],
  fr_id: string,
  to_id: string,
  start: string,
  end: string,
  delay: number
): SlowZoneResponse => ({
  color,
  fr_id,
  to_id,
  start: `${start}T00:00:00`,
  end: `${end}T00:00:00`,
  delay,
  mean_metric: 0,
  duration: 0,
  baseline: 0,
  latest_delay: delay,
  previous_delay: delay,
});

dayjs.extend(utc);

const station = (stopId: string, line: LineShort) => getParentStationForStopId(stopId, line);

const lechmere = station('70502', 'Green');
const riverside = station('70161', 'Green');
const alewife = station('70061', 'Red');
const braintree = station('70105', 'Red');
const ashmontJfk = station('70085', 'Red');

// Southbound (direction 1) stop ids.
const hynesToKenmore = zone('Green', '70153', '70151', '2025-01-01', '2025-01-31', 10);
const kenmoreToFenway = zone('Green', '70151', '70187', '2025-01-01', '2025-01-31', 20);
const copleyToPrudential = zone('Green', '70155', '70239', '2025-01-01', '2025-01-31', 30);
const andrewToAshmontJfk = zone('Red', '70083', '70085', '2025-01-01', '2025-01-31', 40);
const andrewToBraintreeJfk = zone('Red', '70083', '70095', '2025-01-01', '2025-01-31', 50);
const alewifeToDavis = zone('Red', '70061', '70063', '2025-01-01', '2025-01-31', 60);

describe('isZoneOnTrip', () => {
  it('keeps zones on the trip branch and drops other branches', () => {
    expect(isZoneOnTrip(hynesToKenmore, lechmere, riverside, 'Green')).toBe(true);
    expect(isZoneOnTrip(kenmoreToFenway, lechmere, riverside, 'Green')).toBe(true);
    expect(isZoneOnTrip(copleyToPrudential, lechmere, riverside, 'Green')).toBe(false);
    expect(isZoneOnTrip(andrewToBraintreeJfk, alewife, braintree, 'Red')).toBe(true);
    expect(isZoneOnTrip(andrewToAshmontJfk, alewife, braintree, 'Red')).toBe(false);
  });

  it('drops zones running the other way', () => {
    expect(isZoneOnTrip(kenmoreToFenway, riverside, lechmere, 'Green')).toBe(false);
    const fenwayToKenmore = zone('Green', '70186', '70150', '2025-01-01', '2025-01-31', 20);
    expect(isZoneOnTrip(fenwayToKenmore, riverside, lechmere, 'Green')).toBe(true);
  });

  it('includes zones touching either end of the trip and drops ones past it', () => {
    expect(isZoneOnTrip(alewifeToDavis, alewife, braintree, 'Red')).toBe(true);
    expect(isZoneOnTrip(andrewToAshmontJfk, alewife, ashmontJfk, 'Red')).toBe(true);
    expect(isZoneOnTrip(alewifeToDavis, ashmontJfk, braintree, 'Red')).toBe(false);
  });

  it('ignores zones on other lines', () => {
    expect(isZoneOnTrip({ ...alewifeToDavis, color: 'Orange' }, alewife, braintree, 'Red')).toBe(
      false
    );
  });
});

describe('getTripSlowZoneSummary', () => {
  const data = [
    alewifeToDavis,
    andrewToBraintreeJfk,
    andrewToAshmontJfk,
    zone('Red', '70061', '70063', '2025-02-10', '2025-02-20', 15),
  ];

  it('sums the zones active on a single day', () => {
    expect(
      getTripSlowZoneSummary(data, alewife, braintree, 'Red', '2025-01-15', '2025-01-15')
    ).toEqual({
      startDate: '2025-01-15',
      endDate: '2025-01-15',
      startTotal: 110,
      endTotal: 110,
      endZones: 2,
      peakTotal: 110,
      peakDate: '2025-01-15',
    });
  });

  it('reports the end, start, and peak of a range', () => {
    expect(
      getTripSlowZoneSummary(data, alewife, braintree, 'Red', '2024-12-25', '2025-02-15')
    ).toEqual({
      startDate: '2024-12-25',
      endDate: '2025-02-15',
      startTotal: 0,
      endTotal: 15,
      endZones: 1,
      peakTotal: 110,
      peakDate: '2025-01-01',
    });
  });

  it('pulls dates past the latest slow zone data back to it', () => {
    const summary = getTripSlowZoneSummary(
      data,
      alewife,
      braintree,
      'Red',
      '2025-03-01',
      '2025-03-05'
    );
    expect(summary).toMatchObject({ startDate: '2025-02-20', endDate: '2025-02-20', endTotal: 15 });
  });

  it('returns null when no zone on the trip overlaps the dates', () => {
    expect(
      getTripSlowZoneSummary(data, alewife, braintree, 'Red', '2025-02-01', '2025-02-05')
    ).toBeNull();
    expect(
      getTripSlowZoneSummary(data, ashmontJfk, braintree, 'Red', '2025-01-15', '2025-01-15')
    ).toBeNull();
  });
});

describe('getStationPairName', () => {
  const andrew = station('70083', 'Red');
  const braintreeJfk = station('70095', 'Red');

  it('drops the branch suffix from short names', () => {
    expect(getStationPairName(andrew, ashmontJfk, true)).not.toContain('(');
    expect(getStationPairName(braintreeJfk, braintree, true)).toMatch(/^JFK-/);
  });

  it('keeps full stop names when not short', () => {
    expect(getStationPairName(andrew, braintreeJfk)).toBe(
      `${andrew.stop_name}-${braintreeJfk.stop_name}`
    );
  });
});

describe('filterAllSlow', () => {
  const start = dayjs.utc('2025-01-01');
  const end = dayjs.utc('2025-01-31');

  it('keeps zones that start on the end date or end on the start date', () => {
    const startsOnEnd = zone('Red', '70061', '70063', '2025-01-31', '2025-02-10', 10);
    const endsOnStart = zone('Red', '70061', '70063', '2024-12-20', '2025-01-01', 10);
    expect(filterAllSlow([startsOnEnd, endsOnStart], start, end, 'Red')).toEqual([
      startsOnEnd,
      endsOnStart,
    ]);
  });

  it('drops zones entirely outside the dates', () => {
    const before = zone('Red', '70061', '70063', '2024-12-01', '2024-12-31', 10);
    const after = zone('Red', '70061', '70063', '2025-02-01', '2025-02-10', 10);
    expect(filterAllSlow([before, after], start, end, 'Red')).toEqual([]);
  });
});

describe('getWorstSlowZoneSegment', () => {
  const start = dayjs.utc('2025-01-01');
  const end = dayjs.utc('2025-03-31');

  it('skips zones that cleared before the end date, though their latest delay is set', () => {
    const cleared = zone('Red', '70061', '70063', '2025-01-01', '2025-01-10', 300);
    const active = zone('Red', '70083', '70095', '2025-01-05', '2025-03-31', 40);
    expect(cleared.latest_delay).not.toBeNull();
    const worst = getWorstSlowZoneSegment([cleared, active], start, end, 'Red');
    expect(worst).toMatchObject({ delay: 40, from: { station: 'place-andrw' } });
  });

  it('returns null when no zone is active at the end date', () => {
    const cleared = zone('Red', '70061', '70063', '2025-01-01', '2025-01-10', 300);
    expect(getWorstSlowZoneSegment([cleared], start, end, 'Red')).toBeNull();
  });
});

describe('formatSegments', () => {
  const start = dayjs.utc('2025-01-01');

  // Mattapan's Ashmont shares these stop ids, but sits at the start of its line, not the end.
  it("places Red Line zones at Ashmont on Red's Ashmont", () => {
    const shawmutToAshmont = zone('Red', '70091', '70093', '2025-01-01', '2025-01-31', 10);
    const ashmontToShawmut = zone('Red', '70094', '70092', '2025-01-01', '2025-01-31', 10);
    const data = [shawmutToAshmont, ashmontToShawmut];

    const southbound = formatSegments(data, start, 'southbound');
    expect(southbound).toHaveLength(1);
    expect(southbound[0]).toMatchObject({
      from: { station: 'place-smmnl' },
      to: { station: 'place-asmnl', order: station('70093', 'Red').order },
    });
    expect(formatSegments(data, start, 'northbound')).toMatchObject([
      { from: { station: 'place-asmnl' }, to: { station: 'place-smmnl' } },
    ]);
  });
});
