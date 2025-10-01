export type Time = number;

export type LineKind =
  | 'red'
  | 'green'
  | 'orange'
  | 'blue'
  | 'silver'
  | 'regional-rail'
  | 'bus'
  | 'boat';

export type ServiceDay = 'weekday' | 'saturday' | 'sunday';
export type ServiceRegime = 'baseline' | 'current';

export type TripsPerHour = readonly number[] & { length: 24 };

export type WeeklyMedianTimeseries = Record<string, number>;

export type ServiceLevels = {
  cancelled: boolean;
  tripsPerHour?: TripsPerHour;
  totalTrips: number;
};

export type LineData = {
  id: string;
  shortName: string;
  longName: string;
  totalTrips: number;
  serviceFraction: number;
  routeIds: string[];
  ridershipHistory: null | WeeklyMedianTimeseries;
  serviceHistory: WeeklyMedianTimeseries;
  lineKind: LineKind;
  serviceRegimes: Record<ServiceRegime, Record<ServiceDay, ServiceLevels>>;
  startDate: string;
};

export type SummaryData = {
  totalRidershipHistory: null | number[];
  totalServiceHistory: null | number[];
  totalRidershipPercentage: number;
  totalServicePercentage: number;
  totalPassengers: number;
  totalTrips: number;
  totalRoutesCancelled: number;
  totalReducedService: number;
  totalIncreasedService: number;
  startDate: string;
  endDate: string;
};

export type DashboardData = {
  lineData: Record<string, LineData>;
  summaryData: SummaryData;
};

export type ServiceAndRidershipContext = {
  startDate: null | string;
  endDate: null | string;
};
