import type { AggType } from '../../modules/speed/constants/speeds';
import type { ServiceHours, SpeedRestriction } from './dataPoints';
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
  cr: [QueryNameKeys.traveltimes, QueryNameKeys.headways],
  ferry: [QueryNameKeys.traveltimes, QueryNameKeys.headways],
};

export enum SingleDayAPIParams {
  stop = 'stop',
  fromStop = 'from_stop',
  toStop = 'to_stop',
  date = 'date',
}
export type SingleDayAPIOptions = { [key in SingleDayAPIParams]?: string[] | string };
export type PartialSingleDayAPIOptions = Partial<SingleDayAPIOptions>;

export enum AggregateAPIParams {
  stop = 'stop',
  fromStop = 'from_stop',
  toStop = 'to_stop',
  startDate = 'start_date',
  endDate = 'end_date',
}

export type AggregateAPIOptions = { [key in AggregateAPIParams]?: string[] | string };
export type PartialAggregateAPIOptions = Partial<AggregateAPIOptions>;

export type FetchSpeedsOptions = {
  agg: AggType;
  start_date?: string;
  end_date?: string;
  line?: Line;
};

export type FetchDeliveredTripMetricsOptions = {
  agg: AggType;
  start_date?: string;
  end_date?: string;
  line?: Line;
};

export type FetchAlertDelaysByLineOptions = {
  start_date?: string;
  end_date?: string;
  line?: LineRouteId;
};

export enum FetchDeliveredTripMetricsParams {
  startDate = 'start_date',
  endDate = 'end_date',
  agg = 'agg',
  line = 'line',
}

export enum FetchAlertDelaysByLineParams {
  startDate = 'start_date',
  endDate = 'end_date',
  line = 'line',
}

export enum FetchSpeedsParams {
  startDate = 'start_date',
  endDate = 'end_date',
  agg = 'agg',
  line = 'line',
}

export type FetchScheduledServiceOptions = {
  [key in FetchScheduledServiceParams]?: string;
};

export enum FetchScheduledServiceParams {
  startDate = 'start_date',
  endDate = 'end_date',
  routeId = 'route_id',
  agg = 'agg',
}

export type FetchRidershipOptions = {
  [key in FetchRidershipParams]?: string;
};

export enum FetchRidershipParams {
  lineId = 'line_id',
  startDate = 'start_date',
  endDate = 'end_date',
}

export type FetchSpeedRestrictionsOptions = {
  lineId: Line;
  date: string;
};

export type FetchPredictionsParams = {
  route_id: LineRouteId;
};

export type FetchSpeedRestrictionsResponse = {
  available: boolean;
  date: string;
  zones: SpeedRestriction[];
};

export type FetchServiceHoursOptions = Partial<{
  start_date: string;
  end_date: string;
  line_id: string;
  agg: AggType;
}>;

export type FetchServiceHoursResponse = ServiceHours[];
