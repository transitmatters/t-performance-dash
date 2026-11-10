import { describe, expect, it } from 'vitest';
import type { AggregateDataPoint } from '../types/charts';
import type { TripComparison } from '../types/comparison';
import { getComparisonPeriod } from './comparison';
import { getAggDataWidgets, getAggHeadwayDataWidgets, getWidgetComparisonData } from './widgets';

const day = (
  date: string,
  median: number,
  extra: Partial<AggregateDataPoint> = {}
): AggregateDataPoint => ({
  '25%': median,
  '50%': median,
  '75%': median,
  count: 10,
  max: median,
  mean: median,
  min: median,
  std: 0,
  peak: 'all',
  service_date: date,
  ...extra,
});

const weekday = day('2026-09-01', 600);
const weekend = day('2026-09-05', 900, { weekend: true });
const period = getComparisonPeriod('2026-09-01', '2026-10-31', 'year')!;
const lastYear: TripComparison = {
  period,
  data: {
    by_date: [day('2025-09-02', 500), day('2025-09-06', 700, { weekend: true })],
    by_time: [],
  },
  isError: false,
};

describe('getWidgetComparisonData', () => {
  it('compares weekdays with weekends when there is no period', () => {
    expect(getWidgetComparisonData([weekday, weekend], 'weekday', undefined)).toEqual({
      data: [weekend],
      label: 'weekends & holidays',
    });
  });

  it("uses the period instead, through the chart's own day filter", () => {
    const comparison = getWidgetComparisonData([weekday, weekend], 'weekday', lastYear);
    expect(comparison?.label).toBe(period.description);
    expect(comparison?.data.map((p) => p.service_date)).toEqual(['2025-09-02']);
  });

  it('shows nothing while the period is still loading', () => {
    const loading = { ...lastYear, data: undefined };
    expect(getWidgetComparisonData([weekday, weekend], 'weekday', loading)).toBeUndefined();
  });
});

describe('comparison direction', () => {
  const comparisonData = { data: [day('2025-09-02', 500)], label: 'last year' };

  it('counts a longer travel time as worse', () => {
    const [average] = getAggDataWidgets([weekday], 'times', comparisonData);
    expect(average.comparison).toMatchObject({ delta: 100, unit: 'time', higherIsBetter: false });
  });

  it('counts a higher speed as better, in mph', () => {
    const [average] = getAggDataWidgets([weekday], 'speeds', comparisonData);
    expect(average.comparison).toMatchObject({ unit: 'mph', higherIsBetter: true });
  });

  it('counts more on-time trips as better and more bunched trips as worse', () => {
    const now = day('2026-09-01', 600, { bunched: 1, on_time: 8 });
    const before = { data: [day('2025-09-02', 600, { bunched: 3, on_time: 5 })], label: 'x' };
    const widgets = getAggHeadwayDataWidgets([now], 'times', before);
    const onTime = widgets.find((w) => w.text === 'On time');
    const bunched = widgets.find((w) => w.text === 'Bunched');
    expect(onTime?.comparison).toMatchObject({ higherIsBetter: true });
    expect(onTime?.comparison?.delta).toBeCloseTo(0.3);
    expect(bunched?.comparison).toMatchObject({ higherIsBetter: false });
  });
});
