import { skipToken, useQuery } from '@tanstack/react-query';
import { ONE_HOUR } from '../../constants/time';
import { fetchPredictions } from '../predictions';
import type { FetchPredictionsParams } from '../../types/api';
import type { LineRouteId } from '../../types/lines';

/** Waits for a route: Green Line pages have none until a branch is picked. */
export const usePredictionData = (
  { route_id, ...params }: Omit<FetchPredictionsParams, 'route_id'> & { route_id?: LineRouteId },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['predictions', { route_id, ...params }],
    queryFn: route_id && enabled ? () => fetchPredictions({ route_id, ...params }) : skipToken,
    staleTime: ONE_HOUR,
  });
};
