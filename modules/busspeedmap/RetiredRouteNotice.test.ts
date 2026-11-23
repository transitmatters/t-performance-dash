import { describe, expect, it } from 'vitest';
import { getBusRouteIds } from '../../common/constants/lines';
import { getBusRouteStopIds } from '../../common/utils/stations';
import { serviceEndBefore } from './RetiredRouteNotice';

describe('serviceEndBefore', () => {
  it('is the last day of service for a period that starts after it', () => {
    expect(serviceEndBefore('CT2', '2026-11-17', 'monthly')).toBe('2026-04-04');
    expect(serviceEndBefore('CT2', '2026-04-06', 'daily')).toBe('2026-04-04');
  });

  it('is undefined for a period the route ran in, or a route still running', () => {
    expect(serviceEndBefore('CT2', '2026-04-04', 'monthly')).toBeUndefined();
    expect(serviceEndBefore('CT2', '2026-04-04', 'weekly')).toBeUndefined();
    expect(serviceEndBefore('1', '2026-11-17', 'monthly')).toBeUndefined();
    expect(serviceEndBefore(undefined, '2026-11-17', 'monthly')).toBeUndefined();
  });
});

describe('CT2', () => {
  it('is found under the route_id its data is filed under', () => {
    expect(getBusRouteIds('CT2')).toEqual(['747']);
  });

  it("has its stops' GTFS stop_ids", () => {
    expect(getBusRouteStopIds('CT2')).toEqual(expect.arrayContaining(['29001', '29005', '2612']));
    expect(getBusRouteStopIds('not-a-route')).toEqual([]);
  });
});
