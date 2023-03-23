export enum QueryNameKeys {
  traveltimes = 'traveltimes',
  headways = 'headways',
  dwells = 'dwells',
}
export type QueryNameOptions = QueryNameKeys;

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
  [key in FetchSpeedsParams]?: string;
};

export enum FetchSpeedsParams {
  startDate = 'start_date',
  endDate = 'end_date',
  agg = 'agg',
  line = 'line',
}
