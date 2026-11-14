import type { SlowZoneResponse } from '../../../common/types/dataPoints';
import type { SlowZoneMapLabel } from '../constants/constants';

/**
 * The seconds a slow segment's map label shows. Slow time is the zone's delay over its baseline:
 * the latest day's when the map is showing today, otherwise the median over the zone's life.
 * Travel time adds that delay back onto the baseline, the figure the segment's hover card leads with.
 */
export const getSlowZoneLabelSeconds = (
  zone: Pick<SlowZoneResponse, 'delay' | 'latest_delay' | 'baseline'>,
  label: SlowZoneMapLabel,
  isToday: boolean
) => {
  const delay = isToday && zone.latest_delay ? zone.latest_delay : zone.delay;
  return label === 'travel' ? zone.baseline + delay : delay;
};
