import type { Line } from '../../common/types/lines';
import type { FleetType } from '../fleet/constants/fleetTypes';
import type { Direction, MetricId, Unit } from './types';

export interface MetricMethod {
  id: MetricId;
  label: string;
  definition: string;
  direction: Direction;
  /** Cut-offs for win / good / room on `Cell.score`; anything worse is a problem. */
  thresholds: [number, number, number];
  scoreUnit: Unit;
  /** Days after the last data point before the cell reads "Not enough data". */
  staleDays: number;
}

// Thresholds are provisional until TM signs off on them.
export const METRICS: Record<MetricId, MetricMethod> = {
  service: {
    id: 'service',
    label: 'Service',
    definition:
      'Trips per day (the 12-week median) compared with the most the line has run in a 12-week stretch at least 3 years ago. Subway counts trips run; bus, Commuter Rail and ferry count scheduled trips.',
    direction: 'higher',
    thresholds: [1, 0.92, 0.8],
    scoreUnit: 'pct',
    staleDays: 21,
  },
  frequency: {
    id: 'frequency',
    label: 'Frequency',
    definition:
      'Share of scheduled service hours, first trip to last, that meet the goal: every 10 minutes on the subway, 15 on frequent buses, 30 on Commuter Rail. Weekdays count five times as much as Saturday or Sunday. All Bus weights each route by its riders.',
    direction: 'higher',
    thresholds: [1, 0.9, 0.75],
    scoreUnit: 'pct',
    staleDays: 21,
  },
  speed: {
    id: 'speed',
    label: 'Speed',
    definition:
      'Median weekly average speed over 12 weeks, end to end including stops, compared with the fastest 4-week stretch at least 3 years ago.',
    direction: 'higher',
    thresholds: [1, 0.95, 0.88],
    scoreUnit: 'pct',
    staleDays: 21,
  },
  slowZones: {
    id: 'slowZones',
    label: 'Slow zones',
    definition: 'Average extra time per day that slow zones add to a trip, over the last 12 weeks.',
    direction: 'lower',
    thresholds: [30, 60, 180],
    scoreUnit: 'seconds',
    staleDays: 7,
  },
  ridership: {
    id: 'ridership',
    label: 'Ridership',
    definition:
      'Average weekday riders over 12 weeks compared with the busiest 4-week stretch at least 3 years ago.',
    direction: 'higher',
    thresholds: [1, 0.85, 0.65],
    scoreUnit: 'pct',
    staleDays: 28,
  },
  fleet: {
    id: 'fleet',
    label: 'Fleet',
    definition:
      'Age of the oldest cars still in regular service (at least 1% of cars over the last 4 weeks), counted from when that type was first built. Riders feel the oldest trains, not the average. Commuter Rail: share of service that is electrified.',
    direction: 'lower',
    thresholds: [15, 25, 35],
    scoreUnit: 'years',
    staleDays: 21,
  },
};

export const METRIC_ORDER: MetricId[] = [
  'service',
  'frequency',
  'speed',
  'slowZones',
  'ridership',
  'fleet',
];

/** Share of cars (percent, 4-week mean) a type needs to count as still in regular service. */
export const IN_SERVICE_SHARE = 1;

// Lines with a single car type publish no fleet mix, so their build years live here.
export const SINGLE_TYPE_FLEETS: Partial<Record<Line, FleetType>> = {
  'line-blue': { key: 'blue', label: 'Siemens', years: '2007–09' },
  'line-mattapan': { key: 'pcc', label: 'PCC', years: '1945–46' },
};

// Commuter Rail fleet is judged on electrification, which runs the other way.
export const CR_ELECTRIFIED_SHARE = 0;
export const CR_ELECTRIFIED_THRESHOLDS: [number, number, number] = [1, 0.5, 0.1];

/** Headway goals in minutes. */
export const FREQUENCY_GOALS = {
  subway: 10,
  frequentBus: 15,
  bus: 15,
  commuterRail: 30,
} as const;

// GTFS route_desc "Frequent Bus" routes, as grouped in the service & ridership data (SL1–3 and SLW
// are one line there, SL4/SL5 another, 15 rides with 171). Replace with the flag from GTFS once
// data-ingestion publishes it.
export const FREQUENT_BUS_LINE_IDS = [
  'line-SLWaterfront',
  'line-SLWashington',
  'line-1',
  'line-9',
  'line-15171',
  'line-22',
  'line-23',
  'line-28',
  'line-31',
  'line-32',
  'line-39',
  'line-57',
  'line-66',
  'line-71',
  'line-73',
  'line-77',
  'line-104',
  'line-109',
  'line-110',
  'line-111',
  'line-116',
];

export type SubwayLine = 'line-red' | 'line-orange' | 'line-blue' | 'line-green' | 'line-mattapan';

export interface RowConfig {
  id: string;
  label: string;
  group: 'core' | 'also';
  line: Line;
  href: string;
  /** Rows with fewer measured cells than this read "Limited data" instead of a verdict. */
  minMeasured: number;
}

export const ROWS: RowConfig[] = [
  { id: 'red', label: 'Red Line', group: 'core', line: 'line-red', href: '/red', minMeasured: 4 },
  {
    id: 'orange',
    label: 'Orange Line',
    group: 'core',
    line: 'line-orange',
    href: '/orange',
    minMeasured: 4,
  },
  {
    id: 'blue',
    label: 'Blue Line',
    group: 'core',
    line: 'line-blue',
    href: '/blue',
    minMeasured: 4,
  },
  {
    id: 'green',
    label: 'Green Line',
    group: 'core',
    line: 'line-green',
    href: '/green',
    minMeasured: 4,
  },
  {
    id: 'commuter-rail',
    label: 'Commuter Rail',
    group: 'core',
    line: 'line-commuter-rail',
    href: '/commuter-rail/ridership',
    minMeasured: 3,
  },
  {
    id: 'frequent-bus',
    label: 'Frequent Bus',
    group: 'core',
    line: 'line-bus',
    href: '/bus/ridership',
    // Frequency is the promise; service and ridership back it up.
    minMeasured: 2,
  },
  {
    id: 'all-bus',
    label: 'All Bus',
    group: 'core',
    line: 'line-bus',
    href: '/bus/ridership',
    minMeasured: 3,
  },
  {
    id: 'mattapan',
    label: 'Mattapan',
    group: 'also',
    line: 'line-mattapan',
    href: '/mattapan',
    minMeasured: 3,
  },
  {
    id: 'ferry',
    label: 'Ferry',
    group: 'also',
    line: 'line-ferry',
    href: '/ferry/ridership',
    minMeasured: 2,
  },
];

/** Complete weeks in the status window. */
export const WINDOW_WEEKS = 12;
/** Weeks with data needed before a cell gets a status. */
export const MIN_WEEKS = 8;
/** A trend smaller than this reads as flat. */
export const NEGLIGIBLE_TREND = 0.02;
