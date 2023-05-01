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

type HeadwaysSingleDayOptions = Pick<
  SingleDayAPIOptions,
  SingleDayAPIParams.stop | SingleDayAPIParams.date
>;

type HeadwaysAggregateOptions = Pick<
  AggregateAPIOptions,
  AggregateAPIParams.stop | AggregateAPIParams.startDate | AggregateAPIParams.endDate
>;

export const useHeadwaysSingleDayData = (options: HeadwaysSingleDayOptions, enabled?: boolean) => {
  return useQuery(
    [QueryNameKeys.headways, options],
    () => {
      return fetchSingleDayData(QueryNameKeys.headways, options);
    },
    { staleTime: ONE_MINUTE, enabled }
  );
};

export const useHeadwaysAggregateData = (options: HeadwaysAggregateOptions, enabled?: boolean) => {
  return useQuery(
    [QueryNameKeys.headways, options],
    () => {
      return fetchAggregateData(QueryNameKeys.headways, options);
    },
    { staleTime: ONE_MINUTE, enabled }
  );
};
