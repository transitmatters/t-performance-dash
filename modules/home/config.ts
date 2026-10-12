import type { Line } from '../../common/types/lines';
import type { FleetType } from '../fleet/constants/fleetTypes';
import type { Direction, HeroStat, MetricId, Unit } from './types';

/** Headway goals in minutes. */
export const FREQUENCY_GOALS = {
  subway: 10,
  frequentBus: 15,
  bus: 15,
  commuterRail: 30,
} as const;

/** What a row measures against; each measure explains itself per mode. */
export type RowMode = 'subway' | 'commuterRail' | 'frequentBus' | 'bus' | 'ferry';

const WEEKDAY_WEIGHTING = 'Weekdays count five times as much as Saturday or Sunday.';
const SCHEDULED_SERVICE =
  'Scheduled trips per day (the 12-week median), compared with the most scheduled in any 12-week stretch at least 3 years ago.';
const frequencyDefinition = (vehicle: string, minutes: number) =>
  `Share of scheduled service hours, first trip to last, with a ${vehicle} at least every ${minutes} minutes. ${WEEKDAY_WEIGHTING}`;
const BUS_FLEET =
  'Share of bus trips run by battery-electric or hybrid buses over the last 4 weeks.';

export interface MetricMethod {
  id: MetricId;
  label: string;
  /** Shown in a cell's detail; a mode with none isn't measured on this. */
  definitions: Partial<Record<RowMode, string>>;
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
    definitions: {
      subway:
        'Trips run per day (the 12-week median), compared with the busiest 4-week stretch at least 3 years ago.',
      commuterRail: SCHEDULED_SERVICE,
      frequentBus: SCHEDULED_SERVICE,
      bus: SCHEDULED_SERVICE,
      ferry: SCHEDULED_SERVICE,
    },
    direction: 'higher',
    thresholds: [1, 0.92, 0.8],
    scoreUnit: 'pct',
    staleDays: 21,
  },
  frequency: {
    id: 'frequency',
    label: 'Frequency',
    definitions: {
      subway: frequencyDefinition('train', FREQUENCY_GOALS.subway),
      commuterRail: frequencyDefinition('train', FREQUENCY_GOALS.commuterRail),
      frequentBus: frequencyDefinition('bus', FREQUENCY_GOALS.frequentBus),
      bus: `${frequencyDefinition('bus', FREQUENCY_GOALS.bus)} Each route counts by its riders.`,
    },
    direction: 'higher',
    thresholds: [1, 0.9, 0.75],
    scoreUnit: 'pct',
    staleDays: 21,
  },
  speed: {
    id: 'speed',
    label: 'Speed',
    definitions: {
      subway:
        'Median weekly average speed over 12 weeks, end to end including stops, compared with the fastest 4-week stretch at least 3 years ago.',
    },
    direction: 'higher',
    thresholds: [1, 0.95, 0.88],
    scoreUnit: 'pct',
    staleDays: 21,
  },
  slowZones: {
    id: 'slowZones',
    label: 'Slow zones',
    definitions: {
      subway: 'Average extra time per day that slow zones add to a trip, over the last 12 weeks.',
    },
    direction: 'lower',
    thresholds: [30, 60, 180],
    scoreUnit: 'seconds',
    staleDays: 7,
  },
  fleet: {
    id: 'fleet',
    label: 'Vehicles',
    definitions: {
      subway:
        'Age of the oldest cars still in regular service (at least 1% of cars over the last 4 weeks), counted from when that type was first built. Riders feel the oldest trains, not the average.',
      commuterRail: 'Share of Commuter Rail service run with electric trains.',
      frequentBus: BUS_FLEET,
      bus: BUS_FLEET,
    },
    direction: 'lower',
    thresholds: [15, 25, 35],
    scoreUnit: 'years',
    staleDays: 21,
  },
};

export const METRIC_ORDER: MetricId[] = ['service', 'frequency', 'speed', 'slowZones', 'fleet'];

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

// Bus fleet is judged on the share of trips run by battery-electric or hybrid buses.
export const BUS_FLEET_THRESHOLDS: [number, number, number] = [0.9, 0.75, 0.5];

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
  mode: RowMode;
  href: string;
  /** Rows with fewer measured cells than this read "Limited data" instead of a verdict. */
  minMeasured: number;
}

export const ROWS: RowConfig[] = [
  {
    id: 'red',
    label: 'Red Line',
    group: 'core',
    line: 'line-red',
    mode: 'subway',
    href: '/red',
    minMeasured: 4,
  },
  {
    id: 'orange',
    label: 'Orange Line',
    group: 'core',
    line: 'line-orange',
    mode: 'subway',
    href: '/orange',
    minMeasured: 4,
  },
  {
    id: 'blue',
    label: 'Blue Line',
    group: 'core',
    line: 'line-blue',
    mode: 'subway',
    href: '/blue',
    minMeasured: 4,
  },
  {
    id: 'green',
    label: 'Green Line',
    group: 'core',
    line: 'line-green',
    mode: 'subway',
    href: '/green',
    minMeasured: 4,
  },
  {
    id: 'commuter-rail',
    label: 'Commuter Rail',
    group: 'core',
    line: 'line-commuter-rail',
    mode: 'commuterRail',
    href: '/commuter-rail/ridership',
    minMeasured: 3,
  },
  {
    id: 'frequent-bus',
    label: 'Frequent Bus',
    group: 'core',
    line: 'line-bus',
    mode: 'frequentBus',
    href: '/bus/ridership',
    // Frequency is the promise; service backs it up.
    minMeasured: 2,
  },
  {
    id: 'all-bus',
    label: 'All Bus',
    group: 'core',
    line: 'line-bus',
    mode: 'bus',
    href: '/bus/ridership',
    minMeasured: 2,
  },
  {
    id: 'mattapan',
    label: 'Mattapan',
    group: 'also',
    line: 'line-mattapan',
    mode: 'subway',
    href: '/mattapan',
    minMeasured: 3,
  },
  {
    id: 'ferry',
    label: 'Ferry',
    group: 'also',
    line: 'line-ferry',
    mode: 'ferry',
    href: '/ferry/ridership',
    // Scheduled service is the only measure for ferries so far.
    minMeasured: 1,
  },
];

/** The definition of `metric` for a row's mode, or undefined when that mode isn't measured on it. */
export const definitionFor = (metric: MetricId, rowId: string) => {
  const mode = ROWS.find((row) => row.id === rowId)?.mode;
  return mode ? METRICS[metric].definitions[mode] : undefined;
};

/** Complete weeks in the status window. */
export const WINDOW_WEEKS = 12;
/** Weeks with data needed before a cell gets a status. */
export const MIN_WEEKS = 8;
/** A trend smaller than this reads as flat. */
export const NEGLIGIBLE_TREND = 0.02;

export type HeroConfig = Omit<HeroStat, 'value' | 'trend' | 'note'>;

/** The tiles across the top, known before any data loads. */
export const HERO: HeroConfig[] = [
  {
    id: 'subwayFrequency',
    label: 'Subway',
    unit: 'pct',
    detail: `of service hours at every ${FREQUENCY_GOALS.subway} min or better`,
    direction: 'higher',
  },
  {
    id: 'service',
    label: 'Scheduled service',
    unit: 'pct',
    detail: 'of the most trips ever scheduled',
    direction: 'higher',
  },
  {
    id: 'slowZones',
    label: 'Slow zone delay',
    unit: 'minutes',
    detail: 'added per day across the subway, last week',
    direction: 'lower',
  },
  {
    id: 'frequentBus',
    label: 'Frequent Bus',
    unit: 'pct',
    detail: `of service hours at every ${FREQUENCY_GOALS.frequentBus} min or better`,
    direction: 'higher',
  },
  {
    id: 'crHeadway',
    label: 'Commuter Rail midday',
    unit: 'minutes',
    detail: 'between trains on weekdays',
    direction: 'lower',
  },
];
