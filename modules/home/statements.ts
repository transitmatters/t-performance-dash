import dayjs from 'dayjs';
import type { Line } from '../../common/types/lines';
import { FREQUENCY_GOALS, NEGLIGIBLE_TREND, ROWS } from './config';
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
  | { kind: 'meters'; marks: Mark[]; cap: number; rule?: Rule; note?: string }
  | { kind: 'area'; series: [string, number][]; peak: [string, number]; now: number };

export interface Statement {
  id: 'reliability' | 'delays' | 'frequency' | 'service' | 'slowZones';
  kicker: string;
  head: string;
  body: string;
  viz: Viz;
  link: { href: string; label: string };
}

const pct = (value: number) => `${Math.round(value * 100)}%`;
const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
const isGood = (cell?: Cell) => cell?.status === 'good' || cell?.status === 'win';

const rowConfig = (id: string) => ROWS.find((row) => row.id === id);
const labelOf = (id: string) => rowConfig(id)?.label ?? id;

/** "1.3 minutes", "24 minutes" or "2 hours". */
const formatMinutes = (minutes: number) => {
  if (minutes >= 90) return `${Math.round(minutes / 6) / 10} hours`;
  return minutes < 10
    ? `${Math.round(minutes * 10) / 10} minutes`
    : `${Math.round(minutes)} minutes`;
};

const countOf = (n: number, total: number) => (n === total ? `all ${total}` : `${n} of ${total}`);

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

function reliability({ cell, mark, link }: Reader): Statement | undefined {
  const lines = SUBWAY.map((id) => ({ id, cell: cell(id, 'reliability') }));
  if (!lines.every((l) => isNumber(l.cell?.value))) return undefined;
  const thresholds = lines[0].cell?.thresholds;
  if (!thresholds) return undefined;
  const [win, good] = thresholds;
  const values = lines.map((l) => l.cell?.value as number);
  const evenly = lines.filter((l) => isGood(l.cell)).length;
  const worst = lines.reduce((a, b) => ((b.cell?.value ?? 1) < (a.cell?.value ?? 1) ? b : a));
  const bunched = worst.cell?.bunched;

  const head =
    evenly === 0
      ? 'No subway line keeps its trains evenly spaced.'
      : evenly === SUBWAY.length
        ? 'Every subway line keeps its trains evenly spaced.'
        : `${evenly} of ${SUBWAY.length} subway lines keep their trains evenly spaced.`;
  const bunchedText = isNumber(bunched)
    ? ` On the ${labelOf(worst.id)}, ${pct(bunched)} of trains come bunched up behind the one ahead.`
    : '';
  return {
    id: 'reliability',
    kicker: 'Reliability',
    head,
    body: `Between ${pct(Math.min(...values))} and ${pct(Math.max(...values))} of the gaps between trains are on schedule, and Good starts at ${pct(good)}.${bunchedText}`,
    viz: {
      kind: 'dots',
      marks: [...SUBWAY, 'frequent-bus', 'all-bus'].flatMap((id) => {
        const value = cell(id, 'reliability')?.value;
        return isNumber(value) ? [mark(id, value)] : [];
      }),
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
  if (!lines.every((l) => isNumber(l.cell?.minutesPerDay))) return undefined;
  const minutes = lines.map((l) => Math.round(l.cell?.minutesPerDay as number));
  const [low, high] = [Math.min(...minutes), Math.max(...minutes)];
  const worst = lines[minutes.indexOf(high)];
  const up = lines.filter((l) => (l.cell?.trend ?? 0) > NEGLIGIBLE_TREND).length;
  const down = lines.filter((l) => (l.cell?.trend ?? 0) < -NEGLIGIBLE_TREND).length;
  const mattapan = cell('mattapan', 'delays');
  const mattapanMinutes = isNumber(mattapan?.minutesPerDay)
    ? Math.round(mattapan.minutesPerDay)
    : undefined;

  const change =
    up > 0
      ? `That went up on ${countOf(up, SUBWAY.length)} lines in the last two weeks.`
      : down > 0
        ? `That went down on ${countOf(down, SUBWAY.length)} lines in the last two weeks.`
        : 'That has held steady over the last two weeks.';
  const exception =
    mattapanMinutes !== undefined && mattapanMinutes < low
      ? ` Mattapan, at ${mattapanMinutes} minutes, is the exception.`
      : '';
  return {
    id: 'delays',
    kicker: 'Delays',
    head:
      high === 0
        ? 'No subway line has had a delay alert in the last four weeks.'
        : low === high
          ? `Each subway line spends about ${low} minutes a day under a delay alert.`
          : `Each subway line spends ${low} to ${high} minutes a day under a delay alert.`,
    body: change + exception,
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

function frequency({ cell, hero, mark, link }: Reader): Statement | undefined {
  const subway = hero('subwayFrequency')?.value;
  const bus = cell('all-bus', 'frequency')?.value;
  const frequent = cell('frequent-bus', 'frequency')?.value;
  if (!isNumber(subway) || !isNumber(bus) || !isNumber(frequent)) return undefined;
  const frequentText =
    pct(frequent) === pct(bus)
      ? `Frequent Bus routes match that, at ${pct(frequent)} of their hours.`
      : frequent > bus
        ? `Frequent Bus routes do better, at ${pct(frequent)} of their hours.`
        : `Frequent Bus routes manage ${pct(frequent)} of their hours.`;
  return {
    id: 'frequency',
    kicker: 'Frequency',
    head: `On the subway, a train comes every ${FREQUENCY_GOALS.subway} minutes or better for ${pct(subway)} of the service day. Across all bus routes, a bus comes every ${FREQUENCY_GOALS.bus} minutes for ${pct(bus)}.`,
    body: `${frequentText} Commuter Rail isn't judged on frequency, since the MBTA hasn't set a goal for it.`,
    viz: {
      kind: 'meters',
      cap: 1,
      marks: [
        { row: 'subway', label: 'Subway', value: subway },
        mark('frequent-bus', frequent),
        mark('all-bus', bus),
      ],
      note: `Share of service hours with a train at least every ${FREQUENCY_GOALS.subway} minutes, or a bus every ${FREQUENCY_GOALS.bus}.`,
    },
    link: link('frequent-bus', 'frequency', 'frequency'),
  };
}

function service({ cell, hero, mark, link }: Reader): Statement | undefined {
  const lines = SERVICE_ROWS.map((id) => ({ id, cell: cell(id, 'service') })).filter((l) =>
    isNumber(l.cell?.score)
  );
  const good = lines[0]?.cell?.thresholds?.[1];
  if (lines.length < 5 || !isNumber(good)) return undefined;
  const atBest = lines.filter((l) => isGood(l.cell)).length;
  const furthest = lines.reduce((a, b) => ((b.cell?.score ?? 0) < (a.cell?.score ?? 0) ? b : a));
  const furthestScore = furthest.cell?.score as number;
  const system = hero('service')?.value;

  return {
    id: 'service',
    kicker: 'Service',
    head:
      furthestScore >= 1
        ? 'Every line runs as many trips as it did at its best, or more.'
        : atBest === lines.length
          ? `Every line runs at least ${pct(good)} of the trips it ran at its best.`
          : `${atBest} of ${lines.length} lines run at least ${pct(good)} of the trips they ran at their best.`,
    body: [
      isNumber(system)
        ? `Across the system the T is scheduling ${pct(system)} of the most trips it has ever scheduled.`
        : '',
      // Nobody is behind once every line has matched its best.
      furthestScore < 1
        ? `${labelOf(furthest.id)} is the furthest behind, at ${pct(furthestScore)}.`
        : '',
    ]
      .filter(Boolean)
      .join(' '),
    viz: {
      kind: 'meters',
      cap: 1.2,
      marks: lines.map((l) => mark(l.id, l.cell?.score as number)),
      rule: { value: 1, label: 'Best' },
    },
    link: link(furthest.id, 'service', 'service'),
  };
}

function slowZones({ hero }: Reader): Statement | undefined {
  const stat = hero('slowZones');
  const series = stat?.history ?? [];
  if (!isNumber(stat?.value) || series.length < 12) return undefined;
  const peak = series.reduce((a, b) => (b[1] > a[1] ? b : a));
  const then = `In ${dayjs(`${peak[0]}-01`).format('MMMM YYYY')} they added ${formatMinutes(peak[1])}.`;
  return {
    id: 'slowZones',
    kicker: 'Slow zones',
    // Under 3 seconds a day rounds to "0.0 minutes", so call it none.
    head:
      stat.value < 0.05
        ? `There are no slow zones on the subway right now. ${then}`
        : `Slow zones add ${formatMinutes(stat.value)} a day across the subway. ${then}`,
    body: "That's the extra time slow zones put on trips each day, added up across every line. Most were cleared during the MBTA's 2024 track work.",
    viz: { kind: 'area', series, peak, now: stat.value },
    link: { href: '/slowzones', label: 'Slow zones' },
  };
}

/** The statements in page order: the first leads, full width. */
export const buildStatements = (data?: HomeData): Statement[] => {
  if (!data) return [];
  const read = reader(data);
  return [reliability, delays, frequency, service, slowZones].flatMap((build) => build(read) ?? []);
};

/** The line under the page title, as a lead sentence and a quieter second one. */
export const buildLede = (data?: HomeData): { lead: string; rest?: string } | undefined => {
  if (!data) return undefined;
  const { cell } = reader(data);
  const service = SERVICE_ROWS.map((id) => cell(id, 'service')).filter((c) => isNumber(c?.score));
  if (service.length < 5) return undefined;
  const atBest = service.filter(isGood).length;
  const lead = service.every((c) => (c?.score as number) >= 1)
    ? 'The T is running at or above its best service.'
    : atBest / service.length >= 0.7
      ? 'The T is running close to its best service.'
      : `${atBest} of ${service.length} lines run close to their best service.`;

  const reliability = SUBWAY.map((id) => cell(id, 'reliability'));
  if (!reliability.every((c) => isNumber(c?.value))) return { lead };
  const evenly = reliability.filter(isGood).length;
  const rest =
    evenly === 0
      ? 'Keeping trains evenly spaced is where it falls short.'
      : evenly < SUBWAY.length
        ? `Only ${evenly} of ${SUBWAY.length} subway lines keep their trains evenly spaced.`
        : 'Every subway line keeps its trains evenly spaced.';
  return { lead, rest };
};
