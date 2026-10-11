import { describe, expect, it } from 'vitest';
import type { BaselineSeries, HistoricalBaselines } from '../../../common/types/baselines';
import { baselineFor } from './cells';

const series = (overrides: Partial<BaselineSeries>): BaselineSeries => ({
  value: null,
  bestWindow: null,
  ...overrides,
});

const baselines = (byId: Record<string, BaselineSeries>): HistoricalBaselines => ({
  schemaVersion: 1,
  generatedAt: '2026-10-05T08:15:58+00:00',
  cutoff: '2023-10-05',
  lookbackYears: 3,
  minHistoryWeeks: 52,
  heldBackReasons: {
    notComparable: "Counts branch trips differently from the dashboard's service metric.",
    newReason: 'Something we have no local copy for.',
  },
  metrics: { scheduledService: { unit: 'scheduled trips per day', series: byId } },
});

const noteFor = (s: BaselineSeries) =>
  baselineFor(baselines({ id: s }), 'scheduledService', ['id']).note;

describe('baselineFor', () => {
  it('sums the series when every one has a value', () => {
    const file = baselines({
      a: series({
        value: 100,
        bestWindow: { start: '2019-06-10', end: '2019-09-01', weeksWithData: 12 },
      }),
      b: series({ value: 50 }),
    });
    expect(baselineFor(file, 'scheduledService', ['a', 'b'])).toEqual({
      value: 150,
      label: undefined,
    });
    expect(baselineFor(file, 'scheduledService', ['a']).label).toBe('Jun 2019');
  });

  it('prefers the local wording for a held-back reason', () => {
    expect(noteFor(series({ heldBack: 'notComparable', candidateValue: 663 }))).toBe(
      'No baseline yet: service was counted differently before.'
    );
  });

  it("falls back to the file's own reason for one without local wording", () => {
    expect(noteFor(series({ heldBack: 'newReason' }))).toBe(
      'No baseline yet. Something we have no local copy for.'
    );
  });

  it('explains a series whose records are too recent', () => {
    expect(
      noteFor(
        series({
          insufficientHistory: true,
          historyWindow: { start: '2025-05-26', end: '2023-10-05' },
          historyWeeks: 0,
        })
      )
    ).toBe(
      'No baseline yet: records start May 2025, and baselines only use weeks at least 3 years old.'
    );
  });

  it('explains a series with too few old weeks', () => {
    expect(
      noteFor(
        series({
          insufficientHistory: true,
          historyWindow: { start: '2023-01-02', end: '2023-10-05' },
          historyWeeks: 40,
        })
      )
    ).toBe(
      'No baseline yet: 40 weeks of records are at least 3 years old, and a baseline needs 52.'
    );
  });

  it('gives the generic note when nothing explains it', () => {
    expect(baselineFor(null, 'scheduledService', ['id']).note).toBe('No baseline yet.');
  });
});
