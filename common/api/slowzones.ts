import type {
  DayDelayTotals,
  SlowZoneResponse,
  SpeedRestriction,
} from '../../common/types/dataPoints';

export const fetchDelayTotals = (): Promise<DayDelayTotals[]> => {
  const url = new URL(`/static/slowzones/delay_totals.json`, window.location.origin);
  return fetch(url.toString()).then((resp) => resp.json());
};

export const fetchAllSlow = (): Promise<SlowZoneResponse[]> => {
  const all_slow_url = new URL(`/static/slowzones/all_slow.json`, window.location.origin);
  return fetch(all_slow_url.toString()).then((resp) => resp.json());
};

export const fetchSpeedRestrictions = (): Promise<SpeedRestriction[]> => {
  const speed_restrictions_url = new URL(
    `/static/slowzones/speed_restrictions.json`,
    window.location.origin
  );
  return fetch(speed_restrictions_url.toString()).then((resp) => resp.json());
};
