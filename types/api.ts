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
