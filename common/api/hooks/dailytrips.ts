import { useQueries, useQuery } from '@tanstack/react-query';
import type {
  FetchActualTripsByLineOptions,
  FetchActualTripsByRouteOptions,
  FetchSpeedByLineOptions,
} from '../../types/api';
import { FIVE_MINUTES, ONE_HOUR } from '../../constants/time';
import { THREE_MONTHS_AGO_STRING, TODAY_STRING } from '../../constants/dates';
import { LANDING_RAIL_LINES } from '../../types/lines';
import { LINE_OBJECTS } from '../../constants/lines';
import { fetchActualTripsByLine, fetchActualTripsByRoute } from '../dailytrips';

export const useSpeedDataByLine = (params: FetchSpeedByLineOptions, enabled?: boolean) => {
  let routesArray = params.line && LINE_OBJECTS[params.line].routes;
  if (!routesArray) routesArray = [];
  return useQueries({
    queries: routesArray.map((route) => {
      const parameters: FetchActualTripsByLineOptions = {
        line: params.line,
        start_date: params.start_date,
        end_date: params.end_date,
        agg: 'weekly',
      };
      return {
        queryKey: [`${route}-speed`],
        queryFn: () => fetchActualTripsByRoute(parameters),
        staleTime: ONE_HOUR,
        enabled: enabled,
      };
    }),
  });
};

export const useActualTripsDataByLine = (
  params: FetchActualTripsByLineOptions,
  enabled?: boolean
) => {
  return useQuery(['actualTrips', params], () => fetchActualTripsByLine(params), {
    enabled: enabled,
    staleTime: FIVE_MINUTES,
  });
};

export const useActualTripsDataByRoute = (
  params: FetchActualTripsByRouteOptions,
  enabled?: boolean
) => {
  return useQuery(['actualTrips', params], () => fetchActualTripsByRoute(params), {
    enabled: enabled,
    staleTime: FIVE_MINUTES,
  });
};

export const useDailyTripsDataLanding = () => {
  return useQueries({
    queries: LANDING_RAIL_LINES.map((line) => {
      const params: FetchActualTripsByLineOptions = {
        line: line,
        start_date: THREE_MONTHS_AGO_STRING,
        end_date: TODAY_STRING,
        agg: 'weekly',
      };
      return {
        queryKey: [`${line}-speed`],
        queryFn: () => fetchActualTripsByLine(params),
        staleTime: ONE_HOUR,
      };
    }),
  });
};
