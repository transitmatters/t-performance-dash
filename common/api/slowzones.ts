import type {
  DayDelayTotals,
  SlowZoneResponse,
  SpeedRestriction,
} from '../../common/types/dataPoints';
import type { FetchSpeedRestrictionsOptions } from '../types/api';
import { getGtfsRailLineId } from '../utils/lines';

export const fetchDelayTotals = (): Promise<DayDelayTotals[]> => {
  const url = new URL(`/static/slowzones/delay_totals.json`, window.location.origin);
  return fetch(url.toString()).then((resp) => resp.json());
};

export const fetchAllSlow = (): Promise<SlowZoneResponse[]> => {
  const all_slow_url = new URL(`/static/slowzones/all_slow.json`, window.location.origin);
  return fetch(all_slow_url.toString()).then((resp) => resp.json());
};

export const fetchSpeedRestrictions = async (
  options: FetchSpeedRestrictionsOptions
): Promise<SpeedRestriction[]> => {
  const { lineId, date: requestedDate } = options;
  const params = new URLSearchParams({ line_id: getGtfsRailLineId(lineId), date: requestedDate });
  const speedRestrictionsUrl = new URL(
    '/api/speed_restrictions?' + params.toString(),
    window.location.origin
  );
  const today = new Date();
  const response = await fetch(speedRestrictionsUrl.toString());
  const { available, date: resolvedDate, zones } = await response.json();
  if (available) {
    return zones.map((zone) => ({ ...zone, currentAsOf: resolvedDate, validAsOf: today }));
  }
  return [];
};
