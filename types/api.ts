export enum QueryNameKeys {
  traveltimes = 'traveltimes',
  dwells = 'dwells',
  headways = 'headways',
}
export type QueryNameOptions = QueryNameKeys;

export enum SingleDayAPIKeys {
  stop = 'stop',
  fromStop = 'from_stop',
  toStop = 'to_stop',
}
export type SingleDayAPIOptions = { [key in SingleDayAPIKeys]?: string[] | null };

export enum AggregateAPIKeys {
  stop = 'stop',
  fromStop = 'from_stop',
  toStop = 'to_stop',
  start_date = 'start_date',
  end_date = 'end_date',
}

export type AggregateAPIOptions = { [key in AggregateAPIKeys]?: string[] | string };
