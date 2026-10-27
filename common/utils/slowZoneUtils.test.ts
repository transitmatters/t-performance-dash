import { describe, expect, it } from 'vitest';
import type { LineShort } from '../types/lines';
import type { SlowZoneResponse } from '../types/dataPoints';
import { getTripSlowZoneSummary, isZoneOnTrip } from './slowZoneUtils';
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
