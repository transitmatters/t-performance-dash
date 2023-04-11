import { useQuery } from '@tanstack/react-query';
import type {
  AggregateAPIOptions,
  AggregateAPIParams,
  SingleDayAPIOptions,
  SingleDayAPIParams,
} from '../../types/api';
import { QueryNameKeys } from '../../types/api';
import { ONE_MINUTE } from '../../constants/time';
import { fetchAggregateData, fetchSingleDayData } from '../datadashboard';

type DwellsSingleDayOptions = Pick<
  SingleDayAPIOptions,
  SingleDayAPIParams.stop | SingleDayAPIParams.date
>;

type DwellsAggregateOptions = Pick<
  AggregateAPIOptions,
  AggregateAPIParams.stop | AggregateAPIParams.startDate | AggregateAPIParams.endDate
>;

export const useDwellsSingleDayData = (options: DwellsSingleDayOptions, enabled?: boolean) => {
  return useQuery(
    [QueryNameKeys.dwells, options],
    () => {
      return fetchSingleDayData(QueryNameKeys.dwells, options);
    },
    { staleTime: ONE_MINUTE, enabled }
  );
};

export const useDwellsAggregateData = (options: DwellsAggregateOptions, enabled?: boolean) => {
  return useQuery(
    [QueryNameKeys.dwells, options],
    () => {
      return fetchAggregateData(QueryNameKeys.dwells, options);
    },
    { staleTime: ONE_MINUTE, enabled }
  );
};
