import type {
  DayDelayTotals,
  SlowZoneResponse,
  SpeedRestriction,
} from '../../common/types/dataPoints';
import type { FetchSpeedRestrictionsOptions, FetchSpeedRestrictionsResponse } from '../types/api';
import { getGtfsRailLineId } from '../utils/lines';
import { apiFetch } from './utils/fetch';

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
