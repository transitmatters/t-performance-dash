import { i18n } from '../../common/i18n';
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

const SCHEDULED_SERVICE = i18n.t('home:definitions.scheduledService');
const BUS_FLEET = i18n.t('home:definitions.busFleet');

export interface MetricMethod {
  id: MetricId;
  label: string;
  /** The label as it reads mid-sentence ("Held back by service and speed"). */
  inSentence: string;
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
    label: i18n.t('home:metrics.service.label'),
    inSentence: i18n.t('home:metrics.service.inSentence'),
    definitions: {
      subway: i18n.t('home:definitions.subwayService'),
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
    label: i18n.t('home:metrics.frequency.label'),
    inSentence: i18n.t('home:metrics.frequency.inSentence'),
    definitions: {
      subway: i18n.t('home:definitions.frequencyTrain', { minutes: FREQUENCY_GOALS.subway }),
      commuterRail: i18n.t('home:definitions.frequencyTrain', {
        minutes: FREQUENCY_GOALS.commuterRail,
      }),
      frequentBus: i18n.t('home:definitions.frequencyBus', {
        minutes: FREQUENCY_GOALS.frequentBus,
      }),
      bus: i18n.t('home:definitions.frequencyAllBus', { minutes: FREQUENCY_GOALS.bus }),
    },
    direction: 'higher',
    thresholds: [1, 0.9, 0.75],
    scoreUnit: 'pct',
    staleDays: 21,
  },
  speed: {
    id: 'speed',
    label: i18n.t('home:metrics.speed.label'),
    inSentence: i18n.t('home:metrics.speed.inSentence'),
    definitions: {
      subway: i18n.t('home:definitions.speed'),
    },
    direction: 'higher',
    thresholds: [1, 0.95, 0.88],
    scoreUnit: 'pct',
    staleDays: 21,
  },
  slowZones: {
    id: 'slowZones',
    label: i18n.t('home:metrics.slowZones.label'),
    inSentence: i18n.t('home:metrics.slowZones.inSentence'),
    definitions: {
      subway: i18n.t('home:definitions.slowZones'),
    },
    direction: 'lower',
    thresholds: [30, 60, 180],
    scoreUnit: 'seconds',
    staleDays: 7,
  },
  fleet: {
    id: 'fleet',
    label: i18n.t('home:metrics.fleet.label'),
    inSentence: i18n.t('home:metrics.fleet.inSentence'),
    definitions: {
      subway: i18n.t('home:definitions.subwayFleet'),
      commuterRail: i18n.t('home:definitions.commuterRailFleet'),
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
    label: i18n.t('home:rows.red'),
    group: 'core',
    line: 'line-red',
    mode: 'subway',
    href: '/red',
    minMeasured: 4,
  },
  {
    id: 'orange',
    label: i18n.t('home:rows.orange'),
    group: 'core',
    line: 'line-orange',
    mode: 'subway',
    href: '/orange',
    minMeasured: 4,
  },
  {
    id: 'blue',
    label: i18n.t('home:rows.blue'),
    group: 'core',
    line: 'line-blue',
    mode: 'subway',
    href: '/blue',
    minMeasured: 4,
  },
  {
    id: 'green',
    label: i18n.t('home:rows.green'),
    group: 'core',
    line: 'line-green',
    mode: 'subway',
    href: '/green',
    minMeasured: 4,
  },
  {
    id: 'commuter-rail',
    label: i18n.t('home:rows.commuter-rail'),
    group: 'core',
    line: 'line-commuter-rail',
    mode: 'commuterRail',
    href: '/commuter-rail/ridership',
    minMeasured: 3,
  },
  {
    id: 'frequent-bus',
    label: i18n.t('home:rows.frequent-bus'),
    group: 'core',
    line: 'line-bus',
    mode: 'frequentBus',
    href: '/bus/ridership',
    // Frequency is the promise; service backs it up.
    minMeasured: 2,
  },
  {
    id: 'all-bus',
    label: i18n.t('home:rows.all-bus'),
    group: 'core',
    line: 'line-bus',
    mode: 'bus',
    href: '/bus/ridership',
    minMeasured: 2,
  },
  {
    id: 'mattapan',
    label: i18n.t('home:rows.mattapan'),
    group: 'also',
    line: 'line-mattapan',
    mode: 'subway',
    href: '/mattapan',
    minMeasured: 3,
  },
  {
    id: 'ferry',
    label: i18n.t('home:rows.ferry'),
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
    label: i18n.t('home:hero.subwayFrequency.label'),
    unit: 'pct',
    detail: i18n.t('home:hero.frequencyDetail', { minutes: FREQUENCY_GOALS.subway }),
    direction: 'higher',
  },
  {
    id: 'service',
    label: i18n.t('home:hero.service.label'),
    unit: 'pct',
    detail: i18n.t('home:hero.service.detail'),
    direction: 'higher',
  },
  {
    id: 'slowZones',
    label: i18n.t('home:hero.slowZones.label'),
    unit: 'minutes',
    detail: i18n.t('home:hero.slowZones.detail'),
    direction: 'lower',
  },
  {
    id: 'frequentBus',
    label: i18n.t('home:hero.frequentBus.label'),
    unit: 'pct',
    detail: i18n.t('home:hero.frequencyDetail', { minutes: FREQUENCY_GOALS.frequentBus }),
    direction: 'higher',
  },
  {
    id: 'crHeadway',
    label: i18n.t('home:hero.crHeadway.label'),
    unit: 'minutes',
    detail: i18n.t('home:hero.crHeadway.detail'),
    direction: 'lower',
  },
];
