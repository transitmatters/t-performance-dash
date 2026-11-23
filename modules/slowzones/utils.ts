import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import type { DayDelayTotals, SlowZoneAllSlowResponse } from '../../common/types/dataPoints';
import {
  filterAllSlow,
  getSlowZoneDataEndDate,
  getSlowZoneDelayDelta,
  getStationPairName,
  getWorstSlowZoneSegment,
  isSlowZoneActiveAsOf,
} from '../../common/utils/slowZoneUtils';
import { rangeEndsDetail, statDelta } from '../../common/utils/statDelta';
import { getFormattedTimeString } from '../../common/utils/time';

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
  allSlow: SlowZoneAllSlowResponse,
  startDateUTC: dayjs.Dayjs,
  endDateUTC: dayjs.Dayjs,
  lineShort: Exclude<keyof DayDelayTotals, 'date'>
): SlowZoneStats => {
  const filteredTotals = delayTotals.filter((t) => {
    const date = dayjs.utc(t.date);
    return date.isSameOrAfter(startDateUTC) && date.isSameOrBefore(endDateUTC);
  });
  const currentSlowTime = filteredTotals[filteredTotals.length - 1]?.[lineShort] ?? NaN;
  const slowTimeDelta = getSlowZoneDelayDelta(filteredTotals, lineShort);

  // Line-wide (both directions). Dates past the data's last day count as of that day, so a range
  // starting after it, like today alone before the morning run, still finds the zones reaching it.
  const dataEndDateUTC = getSlowZoneDataEndDate(allSlow.updated_on);
  const end = endDateUTC.isAfter(dataEndDateUTC) ? dataEndDateUTC : endDateUTC;
  const start = startDateUTC.isAfter(end) ? end : startDateUTC;
  const zones = filterAllSlow(allSlow.data, start, end, lineShort);
  const activeZones = zones.filter((sz) => isSlowZoneActiveAsOf(sz, end, dataEndDateUTC)).length;
  const startZones = zones.filter((sz) => dayjs.utc(sz.start).isSameOrBefore(start)).length;
  const zonesDelta = activeZones - startZones;

  const worst = getWorstSlowZoneSegment(allSlow.data, start, end, dataEndDateUTC, lineShort);
  const worstSegment = worst
    ? { title: getStationPairName(worst.from, worst.to, true), delay: worst.delay }
    : null;

  return { currentSlowTime, slowTimeDelta, activeZones, zonesDelta, worstSegment };
};

/** Change badge for total slow time, first vs. last day of the range. */
export const slowTimeBadge = ({ currentSlowTime, slowTimeDelta }: SlowZoneStats) =>
  statDelta({
    delta: slowTimeDelta,
    negligible: 60,
    magnitude: `${slowTimeDelta > 0 ? '+' : slowTimeDelta < 0 ? '−' : ''}${getFormattedTimeString(slowTimeDelta)}`,
    words: ['better', 'worse'],
    higherIsBetter: false,
    detail: rangeEndsDetail(
      currentSlowTime - slowTimeDelta,
      currentSlowTime,
      getFormattedTimeString
    ),
  });

/** Change badge for the active slow zone count, start vs. end of the range. */
export const zonesBadge = ({ activeZones, zonesDelta }: SlowZoneStats) =>
  statDelta({
    delta: zonesDelta,
    negligible: 0,
    magnitude: `${zonesDelta > 0 ? '+' : ''}${zonesDelta}`,
    words: ['better', 'worse'],
    higherIsBetter: false,
    detail: rangeEndsDetail(activeZones - zonesDelta, activeZones, String),
  });
