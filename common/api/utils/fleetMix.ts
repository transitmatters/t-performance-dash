import type { FleetMix } from '../../types/dataPoints';

const isFleetMixKey = (key: string): key is `fleet_mix_${string}` => key.startsWith('fleet_mix_');

/**
 * A trip metrics row with its `fleet_mix_<type>` shares typed. The spec can't list those keys, as
 * they vary by line, so it types them `unknown`; any that isn't a number reads as undefined.
 */
export const withFleetMix = <Row extends object>(row: Row): Row & FleetMix => {
  const mix: FleetMix = {};
  Object.entries(row).forEach(([key, value]) => {
    if (isFleetMixKey(key)) mix[key] = typeof value === 'number' ? value : undefined;
  });
  return { ...row, ...mix };
};
