import { useQuery } from '@tanstack/react-query';
import { ONE_HOUR } from '../../constants/time';
import { fetchPredictions } from '../predictions';
import type { FetchPredictionsParams } from '../../types/api';

export const usePredictionData = (params: FetchPredictionsParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['predictions', params],
    queryFn: () => fetchPredictions(params),
    enabled: enabled,
    staleTime: ONE_HOUR,
  });
};
