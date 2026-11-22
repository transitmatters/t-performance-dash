import type { Schemas } from '../../common/types/apiSchemas';

export type Time = number;

export const LINE_KINDS = [
  'red',
  'green',
  'orange',
  'blue',
  'silver',
  'regional-rail',
  'bus',
  'boat',
] as const;

export type LineKind = (typeof LINE_KINDS)[number];

export const isLineKind = (value: string): value is LineKind =>
  LINE_KINDS.some((kind) => kind === value);

export type ModeKind = 'rapid-transit' | 'regional-rail' | 'bus' | 'boat';

export type ServiceDay = 'weekday' | 'saturday' | 'sunday';
export type ServiceRegime = 'baseline' | 'current' | 'oneYearAgo';

/** Trips in each hour of the day, 0 through 23. */
export type TripsPerHour = readonly number[];

export type WeeklyMedianTimeseries = Record<string, number>;

export type ServiceLevels = Schemas['DashboardServiceDay'];

export type LineData = Schemas['DashboardLine'] & { lineKind: LineKind };

export type SummaryData = Schemas['DashboardSummary'];

export type DashboardData = Schemas['ServiceRidershipDashboardResponse'] & {
  lineData: Record<string, LineData>;
};
