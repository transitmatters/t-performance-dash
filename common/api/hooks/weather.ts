import { useQuery } from '@tanstack/react-query';
import type { FetchWeatherOptions } from '../../types/api';
import { ONE_HOUR } from '../../constants/time';
import { fetchWeather } from '../weather';

export const useWeatherData = (options: FetchWeatherOptions, enabled?: boolean) => {
  return useQuery({
    queryKey: ['weather', options],
    queryFn: () => fetchWeather(options),
    enabled: enabled,
    staleTime: ONE_HOUR,
  });
};
