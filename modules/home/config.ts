import type { Line } from '../../common/types/lines';
import type { HeroStat, MetricId } from './types';

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

// How each measure is judged (direction, thresholds, staleness) lives with the computation in
// data-ingestion (chalicelib/overview), which publishes it on every cell.
export interface MetricMethod {
  id: MetricId;
  label: string;
  /** Shown in a cell's detail; a mode with none isn't measured on this. */
  definitions: Partial<Record<RowMode, string>>;
}

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
  },
  speed: {
    id: 'speed',
    label: 'Speed',
    definitions: {
      subway:
        'Median weekly average speed over 12 weeks, end to end including stops, compared with the fastest 4-week stretch at least 3 years ago.',
    },
  },
  slowZones: {
    id: 'slowZones',
    label: 'Slow zones',
    definitions: {
      subway: 'Average extra time per day that slow zones add to a trip, over the last 12 weeks.',
    },
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
  },
};

export const METRIC_ORDER: MetricId[] = ['service', 'frequency', 'speed', 'slowZones', 'fleet'];

export interface RowConfig {
  id: string;
  label: string;
  group: 'core' | 'also';
  line: Line;
  mode: RowMode;
  href: string;
}

export const ROWS: RowConfig[] = [
  {
    id: 'red',
    label: 'Red Line',
    group: 'core',
    line: 'line-red',
    mode: 'subway',
    href: '/red',
  },
  {
    id: 'orange',
    label: 'Orange Line',
    group: 'core',
    line: 'line-orange',
    mode: 'subway',
    href: '/orange',
  },
  {
    id: 'blue',
    label: 'Blue Line',
    group: 'core',
    line: 'line-blue',
    mode: 'subway',
    href: '/blue',
  },
  {
    id: 'green',
    label: 'Green Line',
    group: 'core',
    line: 'line-green',
    mode: 'subway',
    href: '/green',
  },
  {
    id: 'commuter-rail',
    label: 'Commuter Rail',
    group: 'core',
    line: 'line-commuter-rail',
    mode: 'commuterRail',
    href: '/commuter-rail/ridership',
  },
  {
    id: 'frequent-bus',
    label: 'Frequent Bus',
    group: 'core',
    line: 'line-bus',
    mode: 'frequentBus',
    href: '/bus/ridership',
  },
  {
    id: 'all-bus',
    label: 'All Bus',
    group: 'core',
    line: 'line-bus',
    mode: 'bus',
    href: '/bus/ridership',
  },
  {
    id: 'mattapan',
    label: 'Mattapan',
    group: 'also',
    line: 'line-mattapan',
    mode: 'subway',
    href: '/mattapan',
  },
  {
    id: 'ferry',
    label: 'Ferry',
    group: 'also',
    line: 'line-ferry',
    mode: 'ferry',
    href: '/ferry/ridership',
  },
];

/** The definition of `metric` for a row's mode, or undefined when that mode isn't measured on it. */
export const definitionFor = (metric: MetricId, rowId: string) => {
  const mode = ROWS.find((row) => row.id === rowId)?.mode;
  return mode ? METRICS[metric].definitions[mode] : undefined;
};

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
