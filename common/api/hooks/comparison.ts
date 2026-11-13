import { useMemo } from 'react';
import { useTripExplorerQueries } from '../datadashboard';
import { AggregateAPIParams } from '../../types/api';
import type {
  AggregateAPIOptions,
  QueryNameOptions,
  RouteType,
  SingleDayAPIOptions,
} from '../../types/api';
import type { ComparisonPeriod, TripComparison } from '../../types/comparison';
import { useComparisonPeriod } from '../../utils/comparison';

export interface TripComparisons {
  traveltimes?: TripComparison;
  headways?: TripComparison;
  dwells?: TripComparison;
}

/**
 * Fetch the same aggregate trip data for a comparison period. These are the endpoints the page
 * already uses, cached at the CloudFront edge, so nothing extra runs until someone picks a period,
 * and then it is one more request (or set of date chunks) per chart.
 */
export const useTripComparisonQueries = (
  routeType: RouteType,
  parameters: SingleDayAPIOptions | AggregateAPIOptions,
  period: ComparisonPeriod | undefined,
  enabled: boolean,
  // An embed shows one chart, so it fetches only that chart's data.
  queryNames?: QueryNameOptions[]
): TripComparisons => {
  const comparisonParameters: AggregateAPIOptions = {
    [AggregateAPIParams.stop]: parameters[AggregateAPIParams.stop],
    [AggregateAPIParams.fromStop]: parameters[AggregateAPIParams.fromStop],
    [AggregateAPIParams.toStop]: parameters[AggregateAPIParams.toStop],
    [AggregateAPIParams.startDate]: period?.startDate,
    [AggregateAPIParams.endDate]: period?.endDate,
  };
  const { traveltimes, headways, dwells } = useTripExplorerQueries(
    routeType,
    comparisonParameters,
    true,
    enabled && period !== undefined,
    queryNames
  );

  // Charts redraw whenever this changes, so rebuild it only when the data does.
  const traveltimesData = traveltimes?.data;
  const traveltimesError = traveltimes?.isError ?? false;
  const headwaysData = headways?.data;
  const headwaysError = headways?.isError ?? false;
  const dwellsData = dwells?.data;
  const dwellsError = dwells?.isError ?? false;
  const hasTraveltimes = traveltimes !== undefined;
  const hasHeadways = headways !== undefined;
  const hasDwells = dwells !== undefined;
  return useMemo(() => {
    if (!period) return {};
    return {
      traveltimes: hasTraveltimes
        ? { period, data: traveltimesData, isError: traveltimesError }
        : undefined,
      headways: hasHeadways ? { period, data: headwaysData, isError: headwaysError } : undefined,
      dwells: hasDwells ? { period, data: dwellsData, isError: dwellsError } : undefined,
    };
  }, [
    period,
    hasTraveltimes,
    traveltimesData,
    traveltimesError,
    hasHeadways,
    headwaysData,
    headwaysError,
    hasDwells,
    dwellsData,
    dwellsError,
  ]);
};

/** A trip page's comparisons, from its `vs` param. Only the date-range view has any. */
export const useTripPageComparisons = (
  routeType: RouteType,
  parameters: SingleDayAPIOptions | AggregateAPIOptions,
  aggregate: boolean,
  enabled: boolean
) => {
  const period = useComparisonPeriod();
  return useTripComparisonQueries(routeType, parameters, aggregate ? period : undefined, enabled);
};
