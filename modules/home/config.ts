import type { Line } from '../../common/types/lines';
import type { MetricId } from './types';

/** What a row measures against; each measure explains itself per mode. */
export type RowMode = 'subway' | 'commuterRail' | 'frequentBus' | 'bus' | 'ferry';

const SCHEDULED_SERVICE =
  'Scheduled trips per day (the 12-week median), compared with the most scheduled in any 12-week stretch at least 3 years ago.';
const BUS_DELIVERED =
  'Also shows the share of scheduled trips delivered over the last 4 complete weeks; a trip with no bus location data counts as missed.';
const SUBWAY_DROPPED =
  "Share of trips scheduled through each stop that no train stopped for, over the last 4 complete weeks. Each line takes its typical stop, so one stop missing a day's data can't move it. Trains the MBTA runs off schedule count in place of the trips they replace, and Green Line branches count only at stops their branch serves alone.";
const BUS_DROPPED =
  "Share of scheduled trips with no bus location data at all over the last 4 complete weeks, the same estimate as the bus leaderboard's dropped trips. A bus whose tracker is off counts as dropped, so this can run a little high.";
const RIDERSHIP_DEFINITION =
  'Median riders a day over the latest 4 weeks of counts, against the same weeks a year earlier. Each mode publishes on its own schedule, so the weeks compared differ by mode.';
const NOT_SCORED = "Not scored: the T doesn't control ridership directly.";
const reliabilityDefinition = (where: string) =>
  `Share of headways (the wait between one vehicle and the next) within 75–125% of the scheduled headway, at ${where}, over the last 4 complete weeks.`;
const DELAYS_DEFINITION =
  'Share of the service day, first trip to last, with an MBTA delay alert up, over the last 4 complete weeks. Overlapping alerts count once, and each alert counts for at most 3 hours.';

// How each measure is judged (direction, thresholds, staleness) lives with the computation in
// data-ingestion (chalicelib/overview), which publishes it on every cell.
export interface MetricMethod {
  id: MetricId;
  label: string;
  /** For every mode, in the info pill on the column header. */
  summary: string;
  /** Shown in a cell's detail; a mode with none isn't measured on this. */
  definitions: Partial<Record<RowMode, string>>;
}

export const METRICS: Record<MetricId, MetricMethod> = {
  service: {
    id: 'service',
    label: 'Scheduled service',
    summary:
      "Trips per day compared with the line's busiest stretch at least 3 years ago, and how much of the schedule actually ran.",
    definitions: {
      subway:
        'On the subway this counts trips that actually ran per day (the 12-week median), compared with the busiest 4-week stretch at least 3 years ago. Also shows the share of scheduled service hours delivered over the last 4 complete weeks.',
      commuterRail: SCHEDULED_SERVICE,
      frequentBus: `${SCHEDULED_SERVICE} ${BUS_DELIVERED}`,
      bus: `${SCHEDULED_SERVICE} ${BUS_DELIVERED}`,
      ferry: SCHEDULED_SERVICE,
    },
  },
  dropped: {
    id: 'dropped',
    label: 'Trips dropped',
    summary:
      "Share of scheduled trips that didn't run, over the last 4 complete weeks. The subway counts trips scheduled through a stop that no train stopped for; buses count trips no bus was seen on; Commuter Rail counts the MBTA's cancellations.",
    definitions: {
      subway: SUBWAY_DROPPED,
      commuterRail:
        "Share of scheduled trains the MBTA reports as cancelled over the last 4 complete weeks of its published counts. The MBTA publishes these in batches, so they're often weeks behind.",
      frequentBus: BUS_DROPPED,
      bus: BUS_DROPPED,
    },
  },
  reliability: {
    id: 'reliability',
    label: 'Reliability',
    summary:
      "Share of gaps between vehicles within 75–125% of the scheduled gap. Commuter Rail uses the MBTA's on-time share instead.",
    definitions: {
      subway: reliabilityDefinition('every station except the terminals'),
      commuterRail:
        "Share of trains on time over the last 4 complete weeks, by the MBTA's measure. Commuter Rail runs to a timetable rather than headways, so this uses the MBTA's published on-time counts.",
      frequentBus: reliabilityDefinition('mid-route timepoints'),
      bus: reliabilityDefinition('mid-route timepoints'),
    },
  },
  delays: {
    id: 'delays',
    label: 'Delays',
    summary: 'Share of the service day with an MBTA delay alert up.',
    definitions: {
      subway: DELAYS_DEFINITION,
      frequentBus: `${DELAYS_DEFINITION} Routes pool together by their service hours.`,
      bus: `${DELAYS_DEFINITION} Routes pool together by their service hours.`,
    },
  },
  speed: {
    id: 'speed',
    label: 'Speed',
    summary:
      "The worse of average speed against the line's best, and time lost to slow zones. Subway only for now.",
    definitions: {
      subway:
        'The worse of two measures. Speed: median weekly average speed over 12 weeks, end to end including stops, compared with the fastest 4-week stretch at least 3 years ago. Slow zones: average extra time per day that slow zones add to a trip, over the last 12 weeks.',
    },
  },

  ridership: {
    id: 'ridership',
    label: 'Ridership',
    summary:
      "Change in riders from the same weeks a year earlier. Not scored: the T doesn't control ridership directly, though better service tends to bring riders back.",
    definitions: {
      subway: `${RIDERSHIP_DEFINITION} ${NOT_SCORED}`,
      commuterRail: `${RIDERSHIP_DEFINITION} ${NOT_SCORED}`,
      frequentBus: `${RIDERSHIP_DEFINITION} Routes add up. ${NOT_SCORED}`,
      bus: `${RIDERSHIP_DEFINITION} ${NOT_SCORED}`,
      ferry: `${RIDERSHIP_DEFINITION} ${NOT_SCORED}`,
    },
  },
};

/** The measures each line is scored on, in column order. */
export const SCORED_METRICS: MetricId[] = ['service', 'dropped', 'reliability', 'delays', 'speed'];
/** Shown after the scored measures, set apart, off the route line and left out of the verdict. */
export const UNSCORED_METRICS: MetricId[] = ['ridership'];

export interface RowConfig {
  id: string;
  label: string;
  line: Line;
  mode: RowMode;
  href: string;
}

export const ROWS: RowConfig[] = [
  {
    id: 'red',
    label: 'Red Line',
    line: 'line-red',
    mode: 'subway',
    href: '/red',
  },
  {
    id: 'orange',
    label: 'Orange Line',
    line: 'line-orange',
    mode: 'subway',
    href: '/orange',
  },
  {
    id: 'blue',
    label: 'Blue Line',
    line: 'line-blue',
    mode: 'subway',
    href: '/blue',
  },
  {
    id: 'green',
    label: 'Green Line',
    line: 'line-green',
    mode: 'subway',
    href: '/green',
  },
  {
    id: 'commuter-rail',
    label: 'Commuter Rail',
    line: 'line-commuter-rail',
    mode: 'commuterRail',
    href: '/commuter-rail',
  },
  {
    id: 'frequent-bus',
    label: 'Frequent Bus',
    line: 'line-bus',
    mode: 'frequentBus',
    href: '/bus',
  },
  {
    id: 'all-bus',
    label: 'All Buses',
    line: 'line-bus',
    mode: 'bus',
    href: '/bus',
  },
  {
    id: 'mattapan',
    label: 'Mattapan Line',
    line: 'line-mattapan',
    mode: 'subway',
    href: '/mattapan',
  },
  {
    id: 'ferry',
    label: 'Ferry',
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
/**
 * The same for a change in points from a year earlier (`trendBasis: 'yearAgo'`), like dropped trips,
 * whose cut-offs are a few points apart.
 */
export const NEGLIGIBLE_POINTS = 0.002;
