import { createDefaultDiagramForLine } from '@transitmatters/stripmap';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { SlowZoneAllSlowResponse, SlowZoneResponse } from '../../../common/types/dataPoints';
import { segmentSlowZones } from './segment';

const zone = (fr_id: string, to_id: string, start: string, end: string): SlowZoneResponse => ({
  color: 'Red',
  fr_id,
  to_id,
  start: `${start}T00:00:00`,
  end: `${end}T00:00:00`,
  delay: 10,
  mean_metric: 0,
  duration: 0,
  baseline: 0,
  latest_delay: 10,
  previous_delay: 10,
});

// Southbound: Davis to Porter, Porter to Harvard, Shawmut to Ashmont.
const endsJan14 = zone('70063', '70065', '2025-01-01', '2025-01-14');
const startsJan15 = zone('70065', '70067', '2025-01-15', '2025-01-31');
const shawmutToAshmont = zone('70091', '70093', '2025-01-01', '2025-01-31');

const slowZones: SlowZoneAllSlowResponse = {
  // The morning run that covers service through Jan 31.
  updated_on: '2025-02-01T10:05:00+00:00',
  data: [endsJan14, startsJan15, shawmutToAshmont],
};

const zonesOn = (date: string) => {
  const { segments } = segmentSlowZones({
    date,
    slowZones,
    speedRestrictions: [],
    lineName: 'Red',
    diagram: createDefaultDiagramForLine('Red', { pxPerStation: 15, direction: 'horizontal' }),
  });
  return segments.filter((s) => s.slowZones['0'].length || s.slowZones['1'].length);
};

describe('segmentSlowZones', () => {
  // West of UTC, where `new Date('2025-01-15')` is still Jan 14.
  beforeAll(() => vi.stubEnv('TZ', 'America/New_York'));
  afterAll(() => vi.unstubAllEnvs());

  it('shows the zones active on the requested date, not the day before', () => {
    const zones = zonesOn('2025-01-15').flatMap((s) => s.slowZones['0']);
    expect(zones).toContain(startsJan15);
    expect(zones).not.toContain(endsJan14);
  });

  it('pulls dates past the data back to its last day', () => {
    const zones = zonesOn('2025-02-01').flatMap((s) => s.slowZones['0']);
    expect(zones).toEqual(expect.arrayContaining([startsJan15, shawmutToAshmont]));
  });

  it("draws a Red Line zone into Ashmont southbound, not on Mattapan's Ashmont", () => {
    const segment = zonesOn('2025-01-15').find(
      (s) =>
        s.slowZones['0'].includes(shawmutToAshmont) || s.slowZones['1'].includes(shawmutToAshmont)
    );
    expect(segment?.slowZones['0']).toEqual([shawmutToAshmont]);
    expect(segment?.slowZones['1']).toEqual([]);
  });
});
