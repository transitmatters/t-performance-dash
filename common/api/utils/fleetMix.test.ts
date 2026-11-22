import { describe, expect, it } from 'vitest';
import { withFleetMix } from './fleetMix';

describe('withFleetMix', () => {
  it('keeps numeric fleet_mix_* shares and the rest of the row', () => {
    const row = { date: '2026-11-01', route: '1', fleet_mix_hybrid: 0.4 };
    expect(withFleetMix(row)).toEqual(row);
  });

  it('reads a share that is not a number as undefined, as its type says', () => {
    const row = withFleetMix({ date: '2026-11-01', fleet_mix_cng: null, fleet_mix_rotem: 'n/a' });
    expect(row.fleet_mix_cng).toBeUndefined();
    expect(row.fleet_mix_rotem).toBeUndefined();
    expect(row.date).toBe('2026-11-01');
  });
});
