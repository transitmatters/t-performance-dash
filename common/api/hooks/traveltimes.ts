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

type TravelTimesSingleDayOptions = Pick<
  SingleDayAPIOptions,
  SingleDayAPIParams.fromStop | SingleDayAPIParams.toStop | SingleDayAPIParams.date
>;

type TravelTimesAggregateOptions = Pick<
  AggregateAPIOptions,
  | AggregateAPIParams.fromStop
  | AggregateAPIParams.toStop
  | AggregateAPIParams.startDate
  | AggregateAPIParams.endDate
>;

export const useTravelTimesSingleDayData = (
  options: TravelTimesSingleDayOptions,
  enabled?: boolean
) => {
  return useQuery(
    [QueryNameKeys.traveltimes, options],
    () => {
      return fetchSingleDayData(QueryNameKeys.traveltimes, options);
    },
    { staleTime: ONE_MINUTE, enabled }
  );
};

export const useTravelTimesAggregateData = (
  options: TravelTimesAggregateOptions,
  enabled?: boolean
) => {
  return useQuery(
    [QueryNameKeys.traveltimes, options],
    () => {
      return fetchAggregateData(QueryNameKeys.traveltimes, options);
    },
    { staleTime: ONE_MINUTE, enabled }
  );
};
