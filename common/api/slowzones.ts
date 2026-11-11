import type {
  SlowZoneAllSlowResponse,
  SlowZoneDailyDelaysResponse,
  SlowZoneDayTotalsResponse,
  SpeedRestriction,
} from '../types/dataPoints';
import type { FetchSpeedRestrictionsOptions, FetchSpeedRestrictionsResponse } from '../types/api';
import type { SlowZonesLineName } from '../../modules/slowzones/types';
import { getGtfsRailLineId } from '../utils/lines';
import { apiFetch } from './utils/fetch';

export const fetchDelayTotals = (): Promise<SlowZoneDayTotalsResponse> => {
  const url = new URL(`/static/slowzones/delay_totals.json`, window.location.origin);
  return fetch(url.toString()).then((resp) => resp.json());
};

export const fetchAllSlow = (): Promise<SlowZoneAllSlowResponse> => {
  const all_slow_url = new URL(`/static/slowzones/all_slow.json`, window.location.origin);
  return fetch(all_slow_url.toString()).then((resp) => resp.json());
};

export const fetchZoneDelays = async (
  lineShort: SlowZonesLineName
): Promise<SlowZoneDailyDelaysResponse> => {
  const url = new URL(`/static/slowzones/zone_delays/${lineShort}.json`, window.location.origin);
  const resp = await fetch(url.toString());
  if (!resp.ok) throw new Error(`Failed to fetch daily slow zone delays for ${lineShort}`);
  return resp.json();
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
