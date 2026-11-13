import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import type { DayDelayTotals, SlowZoneResponse } from '../../common/types/dataPoints';
import type { LineShort } from '../../common/types/lines';
import {
  filterAllSlow,
  getSlowZoneDelayDelta,
  getStationPairName,
  getWorstSlowZoneSegment,
  isSlowZoneActiveAsOf,
} from '../../common/utils/slowZoneUtils';

dayjs.extend(utc);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export interface SlowZoneStats {
  /** Total time-over-baseline across the line as of the end of the window, in seconds. */
  currentSlowTime: number;
  /** Change in total slow time from the start to the end of the window, in seconds. */
  slowTimeDelta: number;
  /** Slow zones still active as of the end of the window (both directions). */
  activeZones: number;
  /** Change in active-zone count from the start to the end of the window. */
  zonesDelta: number;
  /** The single most time-costly active segment, for headlining. */
  worstSegment: { title: string; delay: number } | null;
}

export const getSlowZoneStats = (
  delayTotals: DayDelayTotals[],
  allSlow: SlowZoneResponse[],
  startDateUTC: dayjs.Dayjs,
  endDateUTC: dayjs.Dayjs,
  lineShort: Exclude<LineShort, 'Bus' | 'Commuter Rail'>
): SlowZoneStats => {
  const filteredTotals = delayTotals.filter((t) => {
    const date = dayjs.utc(t.date);
    return date.isSameOrAfter(startDateUTC) && date.isSameOrBefore(endDateUTC);
  });
  const currentSlowTime = filteredTotals[filteredTotals.length - 1]?.[lineShort] ?? NaN;
  const slowTimeDelta = getSlowZoneDelayDelta(filteredTotals, lineShort);

  // Active-zone counts mirror useSlowZoneQuantityDelta, but line-wide (both directions).
  const zones = filterAllSlow(allSlow, startDateUTC, endDateUTC, lineShort);
  const activeZones = zones.filter((sz) => isSlowZoneActiveAsOf(sz, endDateUTC)).length;
  const startZones = zones.filter((sz) => dayjs.utc(sz.start).isSameOrBefore(startDateUTC)).length;
  const zonesDelta = activeZones - startZones;

  const worst = getWorstSlowZoneSegment(allSlow, startDateUTC, endDateUTC, lineShort);
  const worstSegment = worst
    ? { title: getStationPairName(worst.from, worst.to, true), delay: worst.delay }
    : null;

  return { currentSlowTime, slowTimeDelta, activeZones, zonesDelta, worstSegment };
};
