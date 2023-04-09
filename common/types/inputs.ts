export interface SelectOption<T = any> {
  label: string;
  value: T;
  id: string | number;
}

export type TimeRange = 'week' | 'month' | 'year' | 'all';

export enum TimeRangeNames {
  'week' = 'Past Week',
  'month' = 'Past Month',
  'year' = 'Past Year',
  'all' = 'All Time',
}
