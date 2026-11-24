import dayjs from 'dayjs';
import type { Line } from '../../common/types/lines';
import { NEGLIGIBLE_POINTS, ROWS } from './config';
import { formatChange, formatDroppedShare, roundedPercent } from './format';
import type { Cell, HomeData, MetricId } from './types';

// The "Across the system" statements and the line under the page title: sentences filled in from
// the report card's own numbers each day. A statement whose numbers are missing (an older file, a
// line without data) is left out rather than shown half-true.

const SUBWAY = ['red', 'orange', 'blue', 'green'];
/** The rows the service statement compares; Mattapan and Ferry are too small to sway it. */
const SERVICE_ROWS = ['red', 'orange', 'blue', 'green', 'commuter-rail', 'frequent-bus', 'all-bus'];

export interface Mark {
  row: string;
  /** Unset for a mark that isn't one line, like the whole subway. */
  line?: Line;
  label: string;
  value: number;
  trend?: number | null;
}

export interface Rule {
  value: number;
  label: string;
}

export type Viz =
  | { kind: 'dots'; marks: Mark[]; rules: Rule[] }
  | { kind: 'bars'; unit: string; marks: Mark[] }
  | { kind: 'meters'; marks: Mark[]; cap: number; rule?: Rule }
  /** Shares of trips; each mark's `trend` is the change in points from a year earlier. */
  | { kind: 'shares'; marks: Mark[]; noun: string }
  /** Changes from a year earlier, either side of zero. */
  | { kind: 'changes'; marks: Mark[] }
  | { kind: 'area'; series: [string, number][]; peak: [string, number]; now: number };

export interface Statement {
  id: 'service' | 'dropped' | 'reliability' | 'delays' | 'speed' | 'ridership';
  head: string;
  viz: Viz;
  /** A line under the chart for a term the head can't define, like the service statement's "best". */
  note?: string;
  link: { href: string; label: string };
}

const pct = (value: number) => `${Math.round(value * 100)}%`;
const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
const isGood = (cell?: Cell) => cell?.status === 'good' || cell?.status === 'win';
const isMeasured = (cell?: Pick<Cell, 'status'>) =>
  cell?.status !== 'na' && cell?.status !== 'insufficient';

const rowConfig = (id: string) => ROWS.find((row) => row.id === id);
const labelOf = (id: string) => rowConfig(id)?.label ?? id;

/** "1.3 minutes", "24 minutes" or "2 hours". */
const formatMinutes = (minutes: number) => {
  if (minutes >= 90) return `${Math.round(minutes / 6) / 10} hours`;
  return minutes < 10
    ? `${Math.round(minutes * 10) / 10} minutes`
    : `${Math.round(minutes)} minutes`;
};

const reader = (data: HomeData) => {
  const cell = (row: string, metric: MetricId) =>
    data.rows.find((r) => r.id === row)?.cells[metric];
  const hero = (id: string) => data.hero.find((stat) => stat.id === id);
  const mark = (row: string, value: number, trend?: number | null): Mark => ({
    row,
    line: rowConfig(row)?.line,
    label: labelOf(row),
    value,
    trend,
  });
  const link = (row: string, metric: MetricId, label: string) => ({
    href: cell(row, metric)?.href ?? rowConfig(row)?.href ?? '/',
    label: `${labelOf(row)} ${label}`,
  });
  return { cell, hero, mark, link };
};

type Reader = ReturnType<typeof reader>;

/** Rows judged on how evenly vehicles are spaced. Commuter Rail is judged on time instead. */
const SPACING_ROWS = [...SUBWAY, 'frequent-bus', 'all-bus'];
const isBus = (id: string) => ['frequentBus', 'bus'].includes(rowConfig(id)?.mode ?? '');

/**
 * How many of the rows with headway data keep their vehicles evenly spaced, and the words for
 * them: "subway lines" and "trains" for the subway alone, "lines" and "trains and buses" once
 * buses are in. Undefined unless every subway line has a figure.
 */
const spacing = (cell: Reader['cell']) => {
  const lines = SPACING_ROWS.flatMap((id) => {
    const c = cell(id, 'reliability');
    return c && isNumber(c.value) ? [{ id, cell: c, value: c.value }] : [];
  });
  if (!SUBWAY.every((id) => lines.some((l) => l.id === id))) return undefined;
  const buses = lines.some((l) => isBus(l.id));
  return {
    lines,
    evenly: lines.filter((l) => isGood(l.cell)).length,
    line: buses ? 'line' : 'subway line',
    vehicles: buses ? 'trains and buses' : 'trains',
    /** For "no line keeps its trains or buses evenly spaced". */
    anyVehicles: buses ? 'trains or buses' : 'trains',
  };
};

const spacingSentence = (s: NonNullable<ReturnType<typeof spacing>>) =>
  s.evenly === 0
    ? `No ${s.line} keeps its ${s.anyVehicles} evenly spaced.`
    : s.evenly === s.lines.length
      ? `Every ${s.line} keeps its ${s.vehicles} evenly spaced.`
      : `${s.evenly} of ${s.lines.length} ${s.line}s keep their ${s.vehicles} evenly spaced.`;

function reliability({ cell, mark, link }: Reader): Statement | undefined {
  const s = spacing(cell);
  const thresholds = s?.lines[0].cell?.thresholds;
  if (!s || !thresholds) return undefined;
  const [win, good] = thresholds;
  const worst = s.lines.reduce((a, b) => ((b.cell?.value ?? 1) < (a.cell?.value ?? 1) ? b : a));
  return {
    id: 'reliability',
    head: spacingSentence(s),
    viz: {
      kind: 'dots',
      marks: s.lines.map((l) => mark(l.id, l.value)),
      rules: [
        { value: good, label: 'Good' },
        { value: win, label: 'Win' },
      ],
    },
    link: link(worst.id, 'reliability', 'reliability'),
  };
}

function delays({ cell, mark, link }: Reader): Statement | undefined {
  const lines = SUBWAY.map((id) => ({ id, cell: cell(id, 'delays') }));
  const minutesPerDay = lines.map((l) => l.cell?.minutesPerDay);
  if (!minutesPerDay.every(isNumber)) return undefined;
  const minutes = minutesPerDay.map((m) => Math.round(m));
  const [low, high] = [Math.min(...minutes), Math.max(...minutes)];
  const worst = lines[minutes.indexOf(high)];
  const mattapan = cell('mattapan', 'delays');
  const mattapanMinutes = isNumber(mattapan?.minutesPerDay)
    ? Math.round(mattapan.minutesPerDay)
    : undefined;
  return {
    id: 'delays',
    head:
      high === 0
        ? 'No subway line has had a delay alert in the last four weeks.'
        : low === high
          ? `Each subway line spends about ${low} minutes a day under a delay alert.`
          : `Each subway line spends ${low} to ${high} minutes a day under a delay alert.`,
    viz: {
      kind: 'bars',
      unit: 'min',
      marks: [
        ...lines.map((l, i) => mark(l.id, minutes[i], l.cell?.trend)),
        ...(mattapanMinutes !== undefined
          ? [mark('mattapan', mattapanMinutes, mattapan?.trend)]
          : []),
      ],
    },
    link: link(worst.id, 'delays', 'delays'),
  };
}

function service({ cell, mark, link }: Reader): Statement | undefined {
  const lines = SERVICE_ROWS.flatMap((id) => {
    const c = cell(id, 'service');
    return c && isNumber(c.score) ? [{ id, cell: c, score: c.score }] : [];
  });
  const good = lines[0]?.cell.thresholds?.[1];
  if (lines.length < 5 || !isNumber(good)) return undefined;
  const atBest = lines.filter((l) => isGood(l.cell)).length;
  const furthest = lines.reduce((a, b) => (b.score < a.score ? b : a));
  const furthestScore = furthest.score;

  return {
    id: 'service',
    head:
      furthestScore >= 1
        ? 'Every line runs as many trips as it did at its best, or more.'
        : atBest === lines.length
          ? `Every line runs at least ${pct(good)} of the trips it ran at its best.`
          : `${atBest} of ${lines.length} lines run at least ${pct(good)} of the trips they ran at their best.`,
    viz: {
      kind: 'meters',
      cap: 1.2,
      marks: lines.map((l) => mark(l.id, l.score)),
      rule: { value: 1, label: 'Best' },
    },
    // A line's best only counts weeks at least 3 years old (data-ingestion's LOOKBACK_YEARS), so a
    // line that has added trips since, like the Orange Line in 2025, runs well over 100% of it.
    note: "Best means a line's busiest stretch at least 3 years ago, so one that has added trips since can pass 100%.",
    link: link(furthest.id, 'service', 'scheduled service'),
  };
}

/**
 * A cell's change in points from a year earlier, or undefined when it has none worth saying: its
 * trend is another kind (2 weeks against 12) or under NEGLIGIBLE_POINTS.
 */
const yearAgoChange = (c: Cell) =>
  c.trendBasis === 'yearAgo' && isNumber(c.trend) && Math.abs(c.trend) >= NEGLIGIBLE_POINTS
    ? c.trend
    : undefined;

/** Rows that count dropped trips, in scoreboard order. Subway rows join once they have figures. */
const DROPPED_ROWS = [...SUBWAY, 'commuter-rail', 'frequent-bus', 'all-bus', 'mattapan'];

function dropped({ cell, mark }: Reader): Statement | undefined {
  const lines = DROPPED_ROWS.flatMap((id) => {
    const c = cell(id, 'dropped');
    return c && isNumber(c.value) && isMeasured(c) ? [{ id, cell: c, value: c.value }] : [];
  });
  const bus = lines.find((l) => l.id === 'all-bus')?.cell;
  if (!bus || !isNumber(bus.value)) return undefined;
  const change = yearAgoChange(bus);
  const now = formatDroppedShare(bus.value);
  const then = change === undefined ? undefined : formatDroppedShare(bus.value - change);
  const since =
    then === undefined || then === now
      ? ''
      : change !== undefined && change < 0
        ? `, down from ${then} a year ago`
        : `, up from ${then} a year ago`;
  const cr = lines.find((l) => l.id === 'commuter-rail')?.cell;
  return {
    id: 'dropped',
    head:
      `Buses drop ${now} of scheduled trips${since}.` +
      (cr && isNumber(cr.value) ? ` Commuter Rail cancels ${formatDroppedShare(cr.value)}.` : ''),
    viz: {
      kind: 'shares',
      noun: 'dropped',
      marks: lines.map((l) => mark(l.id, l.value, yearAgoChange(l.cell))),
    },
    note: 'A bus trip counts as dropped when no bus was seen running it.',
    link: { href: bus.href ?? '/bus', label: 'Dropped bus trips' },
  };
}

/** "1.3 minutes a day, down from 2 hours a day in April 2023", or undefined without enough history. */
const slowZoneSentence = (hero: Reader['hero']) => {
  const stat = hero('slowZones');
  const series = stat?.history ?? [];
  if (!isNumber(stat?.value) || series.length < 12) return undefined;
  const peak = series.reduce((a, b) => (b[1] > a[1] ? b : a));
  // The peak is a monthly mean and the value last week's, so a bad week can top it.
  const then =
    stat.value < peak[1]
      ? `, down from ${formatMinutes(peak[1])} a day in ${dayjs(`${peak[0]}-01`).format('MMMM YYYY')}.`
      : '.';
  // Under 3 seconds a day rounds to "0.0 minutes", so call it none.
  const text =
    stat.value < 0.05
      ? `There are no slow zones on the subway right now${then}`
      : `Slow zones add ${formatMinutes(stat.value)} a day across the subway${then}`;
  return { text, viz: { kind: 'area' as const, series, peak, now: stat.value } };
};

/** Each subway line's speed against its best, with slow zones in the sentence. */
function speed({ cell, hero, mark, link }: Reader): Statement | undefined {
  const lines = SUBWAY.map((id) => {
    const part = cell(id, 'speed')?.parts?.find((p) => p.id === 'speed');
    // A stale or thin part keeps its old score, but the scoreboard shows "—" for it.
    return { id, score: part && isMeasured(part) ? part.score : undefined };
  });
  const slowZones = slowZoneSentence(hero);
  const scores = lines.map((l) => l.score);
  if (!scores.every(isNumber)) {
    // No speed baselines: slow zones still tell the story on their own.
    return (
      slowZones && {
        id: 'speed',
        head: slowZones.text,
        viz: slowZones.viz,
        link: { href: '/slowzones', label: 'Slow zones' },
      }
    );
  }
  const [low, high] = [Math.min(...scores), Math.max(...scores)];
  const slowest = lines[scores.indexOf(low)];
  const head =
    Math.round(low * 100) >= 100
      ? 'Every subway line runs as fast as it did at its best, or faster.'
      : pct(low) === pct(high)
        ? `Subway trains run at ${pct(low)} of their best speeds.`
        : `Subway trains run at ${pct(low)} to ${pct(high)} of their best speeds.`;
  return {
    id: 'speed',
    head: slowZones ? `${head} ${slowZones.text}` : head,
    viz: {
      kind: 'meters',
      cap: 1.2,
      marks: lines.map((l, i) => mark(l.id, scores[i])),
      rule: { value: 1, label: 'Best' },
    },
    note: "Best means a line's fastest stretch at least 3 years ago, end to end including stops.",
    link: link(slowest.id, 'speed', 'speed'),
  };
}

/** Rows with ridership, in scoreboard order. Frequent Bus is part of All Buses, so it's left out. */
const RIDERSHIP_ROWS = [...SUBWAY, 'commuter-rail', 'all-bus', 'ferry'];

/** How a sentence names a row after "on": "the Red Line", "Commuter Rail", "buses". */
const onLabel = (id: string) =>
  ({ 'all-bus': 'buses', 'frequent-bus': 'Frequent Bus routes', ferry: 'ferries' })[id] ??
  (labelOf(id).endsWith('Line') ? `the ${labelOf(id)}` : labelOf(id));

function ridership({ cell, mark }: Reader): Statement | undefined {
  const lines = RIDERSHIP_ROWS.flatMap((id) => {
    const c = cell(id, 'ridership');
    return c?.status === 'unscored' && isNumber(c.value) ? [{ id, value: c.value }] : [];
  });
  if (!SUBWAY.every((id) => lines.some((l) => l.id === id))) return undefined;
  const changes = lines.map((l) => l.value);
  const up = changes.filter((c) => roundedPercent(c) > 0).length;
  const most = lines[changes.indexOf(Math.max(...changes))];
  return {
    id: 'ridership',
    head:
      up === lines.length
        ? `Every line carries more riders than a year ago, up to ${formatChange(Math.max(...changes))} on ${onLabel(most.id)}.`
        : up === 0
          ? 'No line carries more riders than a year ago.'
          : `${up} of ${lines.length} lines carry more riders than a year ago.`,
    viz: { kind: 'changes', marks: lines.map((l) => mark(l.id, l.value)) },
    note: "Each line's latest 4 weeks of counts against the same weeks a year earlier. Modes publish on different schedules, so the weeks differ.",
    link: { href: '/system/ridership', label: 'Ridership across the system' },
  };
}

/** The statements in page order: the first leads, full width. */
export const buildStatements = (data?: HomeData): Statement[] => {
  if (!data) return [];
  const read = reader(data);
  return [service, dropped, reliability, delays, speed, ridership].flatMap(
    (build) => build(read) ?? []
  );
};

/** The line under the page title, as a lead sentence and a quieter second one. */
export const buildLede = (data?: HomeData): { lead: string; rest?: string } | undefined => {
  if (!data) return undefined;
  const { cell } = reader(data);
  const serviceCells = SERVICE_ROWS.map((id) => cell(id, 'service')).filter((c) =>
    isNumber(c?.score)
  );
  if (serviceCells.length < 5) return undefined;
  const atBest = serviceCells.filter(isGood).length;
  const lead = serviceCells.every((c) => isNumber(c?.score) && c.score >= 1)
    ? 'The T is running at or above its best service.'
    : atBest / serviceCells.length >= 0.7
      ? 'The T is running close to its best service.'
      : `${atBest} of ${serviceCells.length} lines run close to their best service.`;

  const s = spacing(cell);
  if (!s) return { lead };
  const rest =
    s.evenly === 0
      ? `Keeping ${s.vehicles} evenly spaced is where it falls short.`
      : s.evenly < s.lines.length
        ? `Only ${spacingSentence(s)}`
        : spacingSentence(s);
  return { lead, rest };
};
