import { FREQUENCY_GOALS, METRICS } from './config';
import { formatCell, formatValue } from './format';
import type { Cell, Fact, HeadlineKind, MetricId, Row, Status } from './types';

export const STATUS_LABELS: Record<Status, string> = {
  win: 'Win',
  good: 'Good',
  room: 'Room to grow',
  problem: 'Needs work',
  insufficient: 'Not enough data',
  na: 'Not measured',
};

export const HEADLINE_LABELS: Record<HeadlineKind, string> = {
  strong: 'Strong',
  good: 'Good',
  room: 'Room to grow',
  needsWork: 'Needs work',
  limited: 'Limited data',
};

export const heldBackLabel = (metrics: MetricId[]) =>
  metrics.length
    ? `Held back by ${metrics
        .slice(0, 2)
        .map((m) => METRICS[m].label.toLowerCase())
        .join(' and ')}`
    : undefined;

const goalFor = (row: Row) =>
  row.id === 'commuter-rail'
    ? FREQUENCY_GOALS.commuterRail
    : row.id.endsWith('bus')
      ? FREQUENCY_GOALS.bus
      : FREQUENCY_GOALS.subway;

// Sentences for the wins and issues lists, by metric. Anything without a template falls back to
// the generic line in factSentence.
type Template = (row: Row, cell: Cell, value: string, win: boolean) => string;

const STATUS_COPY: Partial<Record<MetricId, Template>> = {
  service: (row, _cell, value, win) =>
    `${row.label} is running ${win ? '' : 'just '}${value} of its best-ever service.`,
  frequency: (row, _cell, value, win) =>
    win
      ? `${row.label} comes every ${goalFor(row)} minutes or better all day.`
      : `Only ${value} of ${row.label} service hours come every ${goalFor(row)} minutes or better.`,
  speed: (row, _cell, value, win) =>
    win
      ? `${row.label} is as fast as it has ever been: ${value}.`
      : `${row.label} averages ${value}, well below its best.`,
  slowZones: (row, _cell, value, win) =>
    win
      ? `${row.label} is nearly free of slow zones.`
      : `Slow zones add ${value} a day to ${row.label} trips.`,
  ridership: (row, _cell, value) => `${row.label} ridership is at ${value} of its best.`,
  fleet: (row, cell) =>
    row.id === 'commuter-rail'
      ? 'No Commuter Rail service runs on electric trains yet.'
      : `${row.label} cars average ${Math.round(cell.value ?? 0)} years old.`,
};

const TREND_SUBJECT: Record<MetricId, string> = {
  service: 'service',
  frequency: 'frequency',
  speed: 'speed',
  slowZones: 'slow-zone delay',
  ridership: 'ridership',
  fleet: 'average car age',
};

export const factSentence = (fact: Fact, row: Row) => {
  const cell = row.cells[fact.metric];
  const value = formatCell(cell);
  if (fact.key === 'trend' && cell.trend !== null) {
    const change = formatValue(Math.abs(cell.trend), 'pct');
    const dir = cell.trend > 0 ? 'up' : 'down';
    return `${row.label} ${TREND_SUBJECT[fact.metric]} is ${dir} ${change} in the last two weeks.`;
  }
  const template = STATUS_COPY[fact.metric];
  return template
    ? template(row, cell, value, fact.kind === 'win')
    : `${row.label} ${METRICS[fact.metric].label.toLowerCase()}: ${value}.`;
};
