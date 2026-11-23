import type { FetchExcessTripTimeOptions, FetchReliabilityOptions } from '../types/api';
import type { ExcessTripTimeEntry, ReliabilityEntry } from '../types/dataPoints';
import { withWeekStart } from '../utils/date';
import { apiFetch } from './utils/fetch';

export const fetchReliability = async (
  options: FetchReliabilityOptions
): Promise<ReliabilityEntry[]> => {
  const { route_id, start_date, end_date, agg } = withWeekStart(options);
  if (!route_id || !start_date || !end_date || !agg) return [];
  return await apiFetch({
    path: '/api/reliability',
    options: { route_id, start_date, end_date, agg },
    errorMessage: 'Failed to fetch reliability data',
  });
};

export const fetchExcessTripTime = async (
  options: FetchExcessTripTimeOptions
): Promise<ExcessTripTimeEntry[]> => {
  const { line, start_date, end_date, agg } = withWeekStart(options);
  if (!line || !start_date || !end_date || !agg) return [];
  return await apiFetch({
    path: '/api/excess_trip_time',
    options: { line, start_date, end_date, agg },
    errorMessage: 'Failed to fetch excess trip time data',
  });
};
