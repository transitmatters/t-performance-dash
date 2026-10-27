import { useQuery } from '@tanstack/react-query';
import type { FetchShutdownsOptions } from '../../types/api';
import { ONE_HOUR } from '../../constants/time';
import { fetchShutdowns } from '../shutdowns';

export const useShutdownsData = (options: FetchShutdownsOptions, enabled?: boolean) => {
  return useQuery({
    queryKey: ['shutdowns', options],
    queryFn: () => fetchShutdowns(options),
    enabled: enabled,
    staleTime: ONE_HOUR,
  });
};
