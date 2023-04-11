import { useQuery } from '@tanstack/react-query';
import { fetchSpeeds } from '../speed';
import type { FetchSpeedsOptions } from '../../types/api';
import { FIVE_MINUTES } from '../../constants/time';

export const useSpeedData = (params: FetchSpeedsOptions) => {
  return useQuery(['speed', params], () => fetchSpeeds(params), {
    enabled: params.line != undefined,
    staleTime: FIVE_MINUTES,
  });
};
