import { QueryNameKeys } from '../types/api';
import type { ApiPath } from '../types/apiSchemas';
import type { AggregateDataResponse, SingleDayDataPoint } from '../types/charts';
import { apiFetch } from './utils/fetch';

type Stops = Partial<Record<'stop' | 'from_stop' | 'to_stop', string[]>>;

const SINGLE_DAY_PATHS = {
  [QueryNameKeys.traveltimes]: '/api/traveltimes/{user_date}',
  [QueryNameKeys.headways]: '/api/headways/{user_date}',
  [QueryNameKeys.dwells]: '/api/dwells/{user_date}',
} as const satisfies Record<QueryNameKeys, ApiPath>;

// Fetch data for all single day charts.
export const fetchSingleDayData = async (
  name: QueryNameKeys,
  { date, ...stops }: Stops & { date: string }
): Promise<SingleDayDataPoint[]> =>
  apiFetch({
    path: SINGLE_DAY_PATHS[name],
    pathParams: { user_date: date },
    options: stops,
    errorMessage: `Failed to fetch ${name}`,
  });

// Fetch data for all aggregate charts. Travel times come by date and by time of day; the others
// only by date.
export const fetchAggregateData = async (
  name: QueryNameKeys,
  options: Stops & { start_date: string; end_date: string },
  signal?: AbortSignal
): Promise<AggregateDataResponse> => {
  if (name === QueryNameKeys.traveltimes) {
    return apiFetch({
      path: '/api/aggregate/traveltimes2',
      options,
      errorMessage: 'Failed to fetch aggregate traveltimes2',
      signal,
    });
  }
  const byDate = await apiFetch({
    path: name === QueryNameKeys.headways ? '/api/aggregate/headways' : '/api/aggregate/dwells',
    options,
    errorMessage: `Failed to fetch aggregate ${name}`,
    signal,
  });
  return { by_date: byDate, by_time: [] };
};
