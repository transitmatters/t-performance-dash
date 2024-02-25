import type {
  DayDelayTotals,
  SlowZoneAllSlowResponse,
  SlowZoneDayTotalsResponse,
  SlowZoneResponse,
  SpeedRestriction,
} from '../types/dataPoints';
import type { FetchSpeedRestrictionsOptions, FetchSpeedRestrictionsResponse } from '../types/api';
import { getGtfsRailLineId } from '../utils/lines';
import { apiFetch } from './utils/fetch';

// TODO: Remove the Array option once the slowzone change is mature
export const fetchDelayTotals = (): Promise<SlowZoneDayTotalsResponse | DayDelayTotals[]> => {
  const url = new URL(`/static/slowzones/delay_totals.json`, window.location.origin);
  return fetch(url.toString()).then((resp) => resp.json());
};

// TODO: Remove the Array option once the slowzone change is mature
export const fetchAllSlow = (): Promise<SlowZoneAllSlowResponse | SlowZoneResponse[]> => {
  const all_slow_url = new URL(`/static/slowzones/all_slow.json`, window.location.origin);
  return fetch(all_slow_url.toString()).then((resp) => resp.json());
};

export const fetchSpeedRestrictions = async (
  options: FetchSpeedRestrictionsOptions
): Promise<SpeedRestriction[]> => {
  const { lineId, date: requestedDate } = options;

  const {
    available,
    date: resolvedDate,
    zones,
  }: FetchSpeedRestrictionsResponse = await apiFetch({
    path: `/api/speed_restrictions`,
    options: { line_id: getGtfsRailLineId(lineId), date: requestedDate },
    errorMessage: 'Failed to fetch speed restrictions',
  });

  const today = new Date();
  if (available) {
    return zones.map((zone) => ({
      ...zone,
      currentAsOf: new Date(resolvedDate),
      validAsOf: today,
    }));
  }
  return [];
};
