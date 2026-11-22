import type { FetchExcessTripTimeOptions, FetchReliabilityOptions } from '../types/api';
import type { ExcessTripTimeEntry, ReliabilityEntry } from '../types/dataPoints';
import { withWeekStart } from '../utils/date';
import { apiFetch } from './utils/fetch';

export const fetchReliability = async (
  options: FetchReliabilityOptions
): Promise<ReliabilityEntry[]> => {
  return await apiFetch({
    path: '/api/reliability',
    options: withWeekStart(options),
    errorMessage: 'Failed to fetch reliability data',
  });
};

export const fetchExcessTripTime = async (
  options: FetchExcessTripTimeOptions
): Promise<ExcessTripTimeEntry[]> => {
  return await apiFetch({
    path: '/api/excess_trip_time',
    options: withWeekStart(options),
    errorMessage: 'Failed to fetch excess trip time data',
  });
};
