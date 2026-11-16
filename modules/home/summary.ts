import { FREQUENCY_GOALS, METRIC_ORDER, ROWS } from './config';
import type { RowConfig, RowMode } from './config';
import { formatValue } from './format';
import type { Cell, HeadlineKind, MetricId, Row } from './types';

/**
 * Slow-moving capital facts rather than service riders get this month. They stay in each line's
 * own verdict (data-ingestion owns that), but the page's one-line answer leaves them out.
 */
export const LONG_TERM_METRICS: MetricId[] = ['fleet'];

/** How the summary groups line verdicts, worst first. */
export type VerdictGroup = 'needsWork' | 'room' | 'onTrack';

export const VERDICT_GROUPS: VerdictGroup[] = ['needsWork', 'room', 'onTrack'];

const GROUP_OF: Record<HeadlineKind, VerdictGroup | undefined> = {
  needsWork: 'needsWork',
  room: 'room',
  good: 'onTrack',
  strong: 'onTrack',
  limited: undefined,
};

export interface Problem {
  config: RowConfig;
  row: Row;
  cell: Cell;
  /** How far past the "room to grow" cut-off, as a share of it: bigger is worse. */
  shortfall: number;
}

export interface Summary {
  /** Core lines with enough data to judge. */
  judged: number;
  groups: Record<VerdictGroup, RowConfig[]>;
  /** The rider-facing measure that needs work on the most core lines, if any. */
  commonProblem?: { metric: MetricId; lines: number };
  /** At most one per line, worst first. */
  problems: Problem[];
}

const shortfall = (cell: Cell) => {
  const room = cell.thresholds?.[2];
  if (cell.score === null || room === undefined || room === 0 || !cell.direction) return 0;
  return cell.direction === 'higher' ? (room - cell.score) / room : (cell.score - room) / room;
};

const isRiderFacing = (metric: MetricId) => !LONG_TERM_METRICS.includes(metric);

/** The page's answer to "How is the T doing?", from the core lines' verdicts and cells. */
export const summarize = (rows: Row[], limit = 3): Summary => {
  const groups: Record<VerdictGroup, RowConfig[]> = { needsWork: [], room: [], onTrack: [] };
  const problemCounts = new Map<MetricId, number>();
  const problems: Problem[] = [];

  for (const config of ROWS.filter((r) => r.group === 'core')) {
    const row = rows.find((r) => r.id === config.id);
    const group = row && GROUP_OF[row.headline.kind];
    if (!row || !group) continue;
    groups[group].push(config);

    const failing = METRIC_ORDER.filter(isRiderFacing)
      .map((metric) => row.cells[metric])
      .filter((cell): cell is Cell => cell?.status === 'problem');
    for (const cell of failing) {
      problemCounts.set(cell.metric, (problemCounts.get(cell.metric) ?? 0) + 1);
    }
    const worst = failing
      .map((cell) => ({ config, row, cell, shortfall: shortfall(cell) }))
      .sort((a, b) => b.shortfall - a.shortfall)[0];
    if (worst) problems.push(worst);
  }

  // Ties go to the measure that comes first on the scoreboard.
  const common = METRIC_ORDER.filter((m) => problemCounts.has(m)).sort(
    (a, b) => (problemCounts.get(b) ?? 0) - (problemCounts.get(a) ?? 0)
  )[0];

  return {
    judged: VERDICT_GROUPS.reduce((total, g) => total + groups[g].length, 0),
    groups,
    commonProblem: common ? { metric: common, lines: problemCounts.get(common) ?? 0 } : undefined,
    problems: problems.sort((a, b) => b.shortfall - a.shortfall).slice(0, limit),
  };
};

const pct = (value: number | null) => formatValue(value, 'pct');

const FREQUENCY_GOAL: Partial<Record<RowMode, number>> = FREQUENCY_GOALS;

const vehicle = (mode: RowMode) => (mode === 'frequentBus' || mode === 'bus' ? 'bus' : 'train');

/** One plain sentence saying what a failing cell's number means, e.g. "38% of gaps on schedule". */
export const describeProblem = (cell: Cell, mode: RowMode): string => {
  switch (cell.metric) {
    case 'service':
      return `${pct(cell.score)} of the trips it ran at its best`;
    case 'frequency': {
      const goal = FREQUENCY_GOAL[mode];
      return goal
        ? `${pct(cell.value)} of service hours with a ${vehicle(mode)} every ${goal} min`
        : `${pct(cell.value)} of service hours meet the frequency goal`;
    }
    case 'reliability':
      return mode === 'commuterRail'
        ? `${pct(cell.value)} of trains on time`
        : `${pct(cell.value)} of gaps between ${vehicle(mode) === 'bus' ? 'buses' : 'trains'} on schedule`;
    case 'delays':
      return `A delay alert is up ${pct(cell.value)} of the day`;
    case 'speed':
      return `${formatValue(cell.value, cell.unit)}, ${pct(cell.score)} of its best`;
    case 'fleet':
      return formatValue(cell.value, cell.unit);
  }
};
