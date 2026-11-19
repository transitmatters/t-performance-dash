import { describe, expect, it } from 'vitest';
import { getBusRouteDataIds, getBusRouteIds, stripLegacySuffix } from '../constants/lines';
import { getRidershipLineId } from './ridership';

describe('retired bus routes', () => {
  it('read ridership filed under their route_ids', () => {
    expect(getRidershipLineId('line-bus', '110-legacy', undefined, undefined)).toBe('line-110');
    expect(getRidershipLineId('line-bus', '60/65-legacy', undefined, undefined)).toBe('line-6065');
    expect(getRidershipLineId('line-bus', '104/109', undefined, undefined)).toBe('line-104109');
  });

  it('read trip data filed under their route_ids', () => {
    expect(stripLegacySuffix('60/65-legacy')).toBe('60/65');
    expect(getBusRouteDataIds('86-legacy')).toEqual(['86']);
    expect(getBusRouteDataIds('220/221/222-legacy')).toEqual(['220', '221', '222']);
  });

  it("keep their label elsewhere, so pages without date bounds don't show the replacement", () => {
    expect(getBusRouteIds('110-legacy')).toEqual(['110-legacy']);
  });
});
