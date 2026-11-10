import { useQuery } from '@tanstack/react-query';
import type { FetchRidershipOptions } from '../../types/api';
import { fetchBusStopRidership, fetchRidership, fetchStationRidership } from '../ridership';
import { ONE_DAY, ONE_HOUR } from '../../constants/time';

export const useRidershipData = (options: FetchRidershipOptions, enabled?: boolean) => {
  return useQuery({
    queryKey: ['trips', options],
    queryFn: () => fetchRidership(options),
    enabled: enabled,
    staleTime: ONE_HOUR,
  });
};

export const useStationRidershipData = (options: FetchRidershipOptions, enabled?: boolean) => {
  return useQuery({
    queryKey: ['station-ridership', options],
    queryFn: () => fetchStationRidership(options),
    enabled: enabled,
    staleTime: ONE_HOUR,
  });
};

export const useBusStopRidershipData = (routeIds: string[], enabled?: boolean) => {
  return useQuery({
    queryKey: ['bus-stop-ridership', routeIds],
    queryFn: () => fetchBusStopRidership(routeIds),
    enabled: enabled,
    // The MBTA adds a season about once a year
    staleTime: ONE_DAY,
  });
};
