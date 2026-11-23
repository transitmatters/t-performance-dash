import type { ApiQuery } from './apiSchemas';
import type { ServiceHours } from './dataPoints';
import type { Line, LineRouteId } from './lines';

export enum QueryNameKeys {
  traveltimes = 'traveltimes',
  headways = 'headways',
  dwells = 'dwells',
}
export type QueryNameOptions = QueryNameKeys;

export type RouteType = 'bus' | 'subway' | 'cr' | 'ferry';

export const QUERIES: { [key in RouteType]: QueryNameOptions[] } = {
  subway: [QueryNameKeys.traveltimes, QueryNameKeys.headways, QueryNameKeys.dwells],
  bus: [QueryNameKeys.traveltimes, QueryNameKeys.headways],
  cr: [QueryNameKeys.traveltimes, QueryNameKeys.headways, QueryNameKeys.dwells],
  ferry: [QueryNameKeys.traveltimes, QueryNameKeys.headways],
};

export type FetchDeliveredTripMetricsOptions = Partial<ApiQuery<'/api/tripmetrics'>>;

export type FetchBusTripMetricsOptions = Partial<ApiQuery<'/api/bustripmetrics'>>;

export type FetchCrTripMetricsOptions = Partial<ApiQuery<'/api/crtripmetrics'>>;

export type FetchBusSpeedLeaderboardOptions = Partial<ApiQuery<'/api/busspeedleaderboard'>>;

export type FetchAlertDelaysByLineOptions = Partial<ApiQuery<'/api/linedelays'>>;

export type FetchScheduledServiceOptions = Partial<ApiQuery<'/api/scheduledservice'>>;

export type FetchRidershipOptions = Partial<ApiQuery<'/api/ridership'>>;

export type FetchReliabilityOptions = Partial<ApiQuery<'/api/reliability'>>;

export type FetchExcessTripTimeOptions = Partial<ApiQuery<'/api/excess_trip_time'>>;

export type FetchWeatherOptions = Partial<ApiQuery<'/api/weather'>>;

export type FetchShutdownsOptions = Partial<ApiQuery<'/api/shutdowns'>>;

export type FetchSpeedRestrictionsOptions = {
  lineId: Line;
  date: string;
};

export type FetchPredictionsParams = {
  route_id: LineRouteId;
  start_date?: string;
  end_date?: string;
};

export type FetchServiceHoursOptions = Partial<ApiQuery<'/api/service_hours'>>;

export type FetchServiceHoursResponse = ServiceHours[];

export type FetchCrScorecardOptions = Partial<ApiQuery<'/api/crscorecard'>>;
