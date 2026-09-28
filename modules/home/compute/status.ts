import type { MetricMethod } from '../config';
import type { Cell, Headline, MetricId, Status } from '../types';

export const statusFor = (
  score: number | null,
  direction: MetricMethod['direction'],
  [win, good, room]: [number, number, number]
): Status => {
  if (score === null || !Number.isFinite(score)) return 'insufficient';
  if (direction === 'higher') {
    if (score >= win) return 'win';
    if (score >= good) return 'good';
    if (score >= room) return 'room';
    return 'problem';
  }
  if (score <= win) return 'win';
  if (score <= good) return 'good';
  if (score <= room) return 'room';
  return 'problem';
};

export const isMeasured = (status: Status) => status !== 'insufficient' && status !== 'na';

const SEVERITY: Record<Status, number> = {
  problem: 3,
  room: 2,
  good: 1,
  win: 0,
  insufficient: 0,
  na: 0,
};

/** How far a score sits from "good", as a fraction of the good threshold. */
export const gapToGood = (cell: Cell, method: MetricMethod) => {
  if (cell.score === null) return 0;
  const good = method.thresholds[1];
  const gap = method.direction === 'higher' ? good - cell.score : cell.score - good;
  return Math.max(0, gap / Math.abs(good || 1));
};

/**
 * Worst-of, never an average: one problem cell makes the row "Needs work" however good the rest
 * is. "Strong" needs no problems or room to grow and at least half the measured cells winning.
 */
export const headlineFor = (
  cells: Cell[],
  minMeasured: number,
  methods: Record<MetricId, MetricMethod>
): Headline => {
  const measured = cells.filter((cell) => isMeasured(cell.status));
  const heldBackBy = measured
    .filter((cell) => cell.status === 'problem' || cell.status === 'room')
    .sort(
      (a, b) =>
        SEVERITY[b.status] - SEVERITY[a.status] ||
        gapToGood(b, methods[b.metric]) - gapToGood(a, methods[a.metric])
    )
    .map((cell) => cell.metric);

  if (measured.length < minMeasured) return { kind: 'limited', heldBackBy };
  if (measured.some((cell) => cell.status === 'problem')) return { kind: 'needsWork', heldBackBy };
  if (measured.some((cell) => cell.status === 'room')) return { kind: 'room', heldBackBy };
  const wins = measured.filter((cell) => cell.status === 'win').length;
  return { kind: wins >= measured.length / 2 ? 'strong' : 'good', heldBackBy };
};
