import type { DayDelayTotals, SlowZoneResponse } from '../../common/types/dataPoints';

export const fetchDelayTotals = (): Promise<DayDelayTotals[]> => {
  const url = new URL(`/static/slowzones/delay_totals.json`, window.location.origin);
  return fetch(url.toString()).then((resp) => resp.json());
};

export const fetchAllSlow = (): Promise<SlowZoneResponse[]> => {
  const all_slow_url = new URL(`/static/slowzones/all_slow.json`, window.location.origin);
  return fetch(all_slow_url.toString()).then((resp) => resp.json());
};
