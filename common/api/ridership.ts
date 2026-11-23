import type { FetchRidershipOptions } from '../types/api';
import type { BusStopRidership, RidershipCount, StationRidershipWeek } from '../types/dataPoints';
import { RIDERSHIP_KEYS } from '../types/lines';
import { getWeekStart } from '../utils/date';
import { apiFetch } from './utils/fetch';

function sumByDate(arrays: RidershipCount[][]) {
  const result: RidershipCount[] = [];
  arrays.forEach((array) => {
    array.forEach((count, i) => {
      if (!result[i]) {
        result[i] = { date: count.date, count: 0 };
      }
      result[i].count += count.count;
    });
  });
  return result;
}

export const fetchRidership = async (
  options: FetchRidershipOptions
): Promise<RidershipCount[] | undefined> => {
  const { start_date, end_date, line_id } = options;
  if (!start_date || !end_date) return undefined;
  const dates = { start_date: getWeekStart(start_date), end_date };

  // If we don't have a lineId, return a systemwide merged total
  if (!line_id) {
    const ridershipCounts = await Promise.all(
      Object.values(RIDERSHIP_KEYS).map((lineId) =>
        apiFetch({
          path: '/api/ridership',
          options: { ...dates, line_id: lineId },
          errorMessage: 'Failed to fetch ridership counts',
        })
      )
    );
    return sumByDate(ridershipCounts);
  }

  return await apiFetch({
    path: '/api/ridership',
    options: { ...dates, line_id },
    errorMessage: 'Failed to fetch ridership counts',
  });
};

export const fetchStationRidership = async (
  options: FetchRidershipOptions
): Promise<StationRidershipWeek[]> => {
  const { start_date, end_date, line_id } = options;
  if (!start_date || !end_date || !line_id) return [];
  return await apiFetch({
    path: '/api/station_ridership',
    options: { start_date: getWeekStart(start_date), end_date, line_id },
    errorMessage: 'Failed to fetch station ridership',
  });
};

/** One request per GTFS route, since a combined route like 17/19 is shown one route at a time */
export const fetchBusStopRidership = async (routeIds: string[]): Promise<BusStopRidership[]> =>
  await Promise.all(
    routeIds.map((routeId) =>
      apiFetch({
        path: '/api/bus_stop_ridership',
        options: { route_id: routeId },
        errorMessage: 'Failed to fetch bus stop ridership',
      })
    )
  );
