import { describe, expect, it } from 'vitest';

import {
  formatCell,
  formatThresholds,
  formatTrend,
  formatValue,
  topCauseLabel,
  trendSentiment,
} from './format';
import type { Cell } from './types';

describe('formatTrend', () => {
  it('shows the change since the 12-week window with an arrow', () => {
    expect(formatTrend({ trend: 0.05 })).toBe('▲ 5% last 2 weeks vs 12');
    expect(formatTrend({ trend: -0.28 })).toBe('▼ 28% last 2 weeks vs 12');
  });

  it('compares points with a year ago when the basis says so', () => {
    expect(formatTrend({ trend: 0.03, trendBasis: 'yearAgo' })).toBe('▲ 3 pts vs a year ago');
    expect(formatTrend({ trend: -0.0042, trendBasis: 'yearAgo' })).toBe('▼ 0.4 pts vs a year ago');
  });

  it('is empty without a trend', () => {
    expect(formatTrend({ trend: null })).toBeNull();
    expect(formatTrend({ trend: NaN })).toBeNull();
  });

  it('leaves the arrow off a change that rounds to zero', () => {
    expect(formatTrend({ trend: 0.004 })).toBe('0% last 2 weeks vs 12');
    expect(formatTrend({ trend: -0.004 })).toBe('0% last 2 weeks vs 12');
    expect(formatTrend({ trend: 0.0004, trendBasis: 'yearAgo' })).toBe('0 pts vs a year ago');
  });
});

describe('topCauseLabel', () => {
  it('names the cause as the Delays page does', () => {
    expect(topCauseLabel({ topCause: { cause: 'signal_problem', share: 0.3 } }, 'line-red')).toBe(
      'Signal problem'
    );
  });

  it('says bus for a disabled vehicle on a bus row', () => {
    const topCause = { cause: 'disabled_vehicle', share: 0.5 } as const;
    expect(topCauseLabel({ topCause }, 'line-red')).toBe('Disabled train');
    expect(topCauseLabel({ topCause }, 'line-bus')).toBe('Disabled bus');
  });

  it('is empty without a cause, or with one it does not know', () => {
    expect(topCauseLabel({}, 'line-red')).toBeUndefined();
    // As the API could send it; the type only lists the causes we know.
    const unknown: Cell['topCause'] = JSON.parse('{ "cause": "gremlins", "share": 0.5 }');
    expect(topCauseLabel({ topCause: unknown }, 'line-red')).toBeUndefined();
  });
});

describe('trendSentiment', () => {
  it('colors a year-ago change of a couple of points, which a 2% relative cut-off would grey out', () => {
    expect(trendSentiment(0.018, 'lower', 'yearAgo')).toBe('bad');
    expect(trendSentiment(-0.005, 'lower', 'yearAgo')).toBe('good');
    expect(trendSentiment(0.001, 'lower', 'yearAgo')).toBe('flat');
    expect(trendSentiment(0.018, 'lower')).toBe('flat');
  });

  it('reads a change as good or bad by which way is better', () => {
    expect(trendSentiment(0.1, 'higher')).toBe('good');
    expect(trendSentiment(0.1, 'lower')).toBe('bad');
    expect(trendSentiment(-0.1, 'lower')).toBe('good');
  });

  it('reads a negligible or missing change as flat', () => {
    expect(trendSentiment(0.01, 'higher')).toBe('flat');
    expect(trendSentiment(null, 'higher')).toBe('flat');
  });
});

describe('formatValue', () => {
  it('shows a dash for a missing value', () => {
    expect(formatValue(null, 'pct')).toBe('—');
    expect(formatValue(Infinity, 'mph')).toBe('—');
  });

  it('formats each unit', () => {
    expect(formatValue(0.912, 'pct')).toBe('91%');
    expect(formatValue(23.64, 'mph')).toBe('23.6 mph');
    expect(formatValue(45, 'seconds')).toBe('45 s');
    expect(formatValue(120, 'seconds')).toBe('2 min');
    expect(formatValue(1.5, 'minutes')).toBe('1.5 min');
    expect(formatValue(60, 'minutes')).toBe('60 min');
    expect(formatValue(120, 'minutes')).toBe('2 hr');
    expect(formatValue(57.4, 'years')).toBe('57 yr');
    expect(formatValue(1234, 'count')).toBe('1.2k');
    expect(formatValue(12_345, 'count')).toBe('12k');
  });

  it('switches unit when the rounded figure reaches the cut-off', () => {
    expect(formatValue(89.4, 'seconds')).toBe('89 s');
    expect(formatValue(89.6, 'seconds')).toBe('1.5 min');
    expect(formatValue(89.6, 'minutes')).toBe('1.5 hr');
    expect(formatValue(999.4, 'count')).toBe('999');
    expect(formatValue(999.96, 'count')).toBe('1k');
  });
});

describe('formatCell', () => {
  const cell: Cell = {
    metric: 'service',
    status: 'good',
    score: 0.98,
    value: 412,
    unit: 'count',
    unitLabel: 'trips/day',
    trend: null,
  };

  it('adds the count label only when asked', () => {
    expect(formatCell(cell)).toBe('412');
    expect(formatCell(cell, true)).toBe('412 trips/day');
  });

  it('shows n/a for a measure that does not apply', () => {
    expect(formatCell({ ...cell, status: 'na' })).toBe('n/a');
  });

  it('shows a dash on the board for a cell without enough data, and the figure in the detail', () => {
    const insufficient: Cell = { ...cell, status: 'insufficient', value: 96 };
    expect(formatCell(insufficient)).toBe('—');
    expect(formatCell(insufficient, true)).toBe('96 trips/day');
  });

  it('does not label a missing value', () => {
    expect(formatCell({ ...cell, value: null }, true)).toBe('—');
  });

  it('keeps a tenth of a percent for dropped trips under 10%', () => {
    const dropped: Cell = { ...cell, metric: 'dropped', unit: 'pct', unitLabel: undefined };
    expect(formatCell({ ...dropped, value: 0.0057 })).toBe('0.6%');
    // Whole values keep their tenth, so the column lines up.
    expect(formatCell({ ...dropped, value: 0.02 })).toBe('2.0%');
    expect(formatCell({ ...dropped, value: 0.12 })).toBe('12%');
  });

  it('signs a ridership change', () => {
    const ridership: Cell = { ...cell, metric: 'ridership', status: 'unscored', unit: 'pct' };
    expect(formatCell({ ...ridership, value: 0.102 })).toBe('+10%');
    expect(formatCell({ ...ridership, value: -0.04 })).toBe('−4%');
    expect(formatCell({ ...ridership, value: 0.001 })).toBe('0%');
    // Halves round away from zero either way.
    expect(formatCell({ ...ridership, value: 0.005 })).toBe('+1%');
    expect(formatCell({ ...ridership, value: -0.005 })).toBe('−1%');
  });
});

describe('formatThresholds', () => {
  it('prints dropped-trip cut-offs to the same tenth as the figure', () => {
    expect(
      formatThresholds({
        metric: 'dropped',
        thresholds: [0.01, 0.02, 0.05],
        direction: 'lower',
        scoreUnit: 'pct',
      })
    ).toBe('Win ≤1.0% · Good ≤2.0% · Room to grow ≤5.0%');
  });

  it('lists the cut-offs in the score unit', () => {
    expect(
      formatThresholds({ thresholds: [1, 0.92, 0.8], direction: 'higher', scoreUnit: 'pct' })
    ).toBe('Win ≥100% · Good ≥92% · Room to grow ≥80%');
    expect(
      formatThresholds({ thresholds: [30, 60, 120], direction: 'lower', scoreUnit: 'seconds' })
    ).toBe('Win ≤30 s · Good ≤60 s · Room to grow ≤120 s');
  });

  it('is empty for a cell that is not judged', () => {
    expect(formatThresholds({})).toBeUndefined();
  });
});
