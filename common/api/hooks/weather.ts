import { useCallback, useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { FetchWeatherOptions } from '../../types/api';
import type { WeatherHourly } from '../../types/weather';
import { ONE_HOUR } from '../../constants/time';
import { splitDateRange } from '../../utils/dateChunks';
import { fetchWeather } from '../weather';

/**
 * Hourly weather for a date range. Ranges over a year are fetched a calendar year at a time, like
 * trip data, and the hours fill in as each year arrives.
 */
export const useWeatherData = (options: FetchWeatherOptions, enabled?: boolean) => {
  const { start_date: startDate, end_date: endDate } = options;
  const chunks: FetchWeatherOptions[] = useMemo(
    () =>
      startDate && endDate
        ? splitDateRange(startDate, endDate).map((chunk) => ({
            start_date: chunk.startDate,
            end_date: chunk.endDate,
          }))
        : [{ start_date: startDate, end_date: endDate }],
    [startDate, endDate]
  );

  const combine = useCallback((results: UseQueryResult<WeatherHourly[]>[]) => {
    const loaded = results.filter((result) => result.data);
    // Chunks come newest first
    const data = loaded.length
      ? [...loaded].toReversed().flatMap((result) => result.data ?? [])
      : undefined;
    const pending = !data && results.some((result) => result.isPending);
    return {
      data,
      isPending: pending,
      isLoading: pending && results.some((result) => result.isFetching),
    };
  }, []);

  return useQueries({
    queries: chunks.map((params) => ({
      queryKey: ['weather', params],
      queryFn: () => fetchWeather(params),
      enabled,
      staleTime: ONE_HOUR,
    })),
    combine,
  });
};
