import { describe, expect, it } from 'vitest';
import { describeProblem, summarize } from './summary';
import type { Cell, HeadlineKind, MetricId, Row, Status } from './types';

const cell = (metric: MetricId, status: Status, score: number | null = null): Cell => ({
  metric,
  status,
  score,
  value: score,
  unit: 'pct',
  trend: null,
  direction: 'higher',
  thresholds: [1, 0.9, 0.5],
});

const row = (id: string, kind: HeadlineKind, cells: Partial<Record<MetricId, Cell>> = {}): Row => ({
  id,
  label: id,
  group: 'core',
  line: 'line-red',
  href: `/${id}`,
  headline: { kind, heldBackBy: [] },
  cells,
});

describe('summarize', () => {
  it('groups core lines by verdict and leaves out ones too thin to judge', () => {
    const summary = summarize([
      row('red', 'needsWork'),
      row('orange', 'room'),
      row('blue', 'strong'),
      row('green', 'good'),
      row('commuter-rail', 'limited'),
      row('mattapan', 'needsWork'),
    ]);
    expect(summary.judged).toBe(4);
    expect(summary.groups.needsWork.map((r) => r.id)).toEqual(['red']);
    expect(summary.groups.onTrack.map((r) => r.id)).toEqual(['blue', 'green']);
  });

  it('ranks the worst problem per line and ignores vehicles', () => {
    const summary = summarize([
      row('red', 'needsWork', {
        reliability: cell('reliability', 'problem', 0.4),
        fleet: cell('fleet', 'problem', 0),
      }),
      row('green', 'needsWork', {
        reliability: cell('reliability', 'problem', 0.45),
        speed: cell('speed', 'problem', 0.1),
      }),
      row('blue', 'needsWork', { fleet: cell('fleet', 'problem', 0) }),
    ]);
    expect(summary.problems.map((p) => [p.config.id, p.cell.metric])).toEqual([
      ['green', 'speed'],
      ['red', 'reliability'],
    ]);
    expect(summary.commonProblem).toEqual({ metric: 'reliability', lines: 2 });
  });

  it('caps the problem list', () => {
    const rows = ['red', 'orange', 'blue', 'green'].map((id) =>
      row(id, 'needsWork', { delays: cell('delays', 'problem', 0.1) })
    );
    expect(summarize(rows, 3).problems).toHaveLength(3);
  });
});

describe('describeProblem', () => {
  it('says what the number means for the mode', () => {
    expect(describeProblem(cell('reliability', 'problem', 0.38), 'subway')).toBe(
      '38% of gaps between trains on schedule'
    );
    expect(describeProblem(cell('reliability', 'problem', 0.84), 'commuterRail')).toBe(
      '84% of trains on time'
    );
    expect(describeProblem(cell('frequency', 'problem', 0.54), 'bus')).toBe(
      '54% of service hours with a bus every 15 min'
    );
  });
});
