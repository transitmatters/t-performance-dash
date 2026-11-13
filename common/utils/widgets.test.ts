import { describe, expect, it } from 'vitest';

import type { AggregateDataPoint, SingleDayDataPoint } from '../types/charts';
import type { TripComparison } from '../types/comparison';
import { getComparisonPeriod } from './comparison';
import {
  getAggDataWidgets,
  getAggHeadwayDataWidgets,
  getSingleDayWidgets,
  getWidgetComparisonData,
} from './widgets';

const headway = (sec: number, benchmark: number | null): SingleDayDataPoint => ({
  route_id: 'Red',
  direction: 0,
  headway_time_sec: sec,
  benchmark_headway_time_sec: benchmark,
});

const day = (counts: Partial<AggregateDataPoint>): AggregateDataPoint => ({
  '25%': 300,
  '50%': 360,
  '75%': 420,
  max: 900,
  mean: 360,
  min: 60,
  std: 60,
  count: 0,
  ...counts,
});

const shares = (widgets: { text: string; widgetValue: { value?: number } }[]) =>
  Object.fromEntries(
    widgets
      .filter((widget) => widget.text.startsWith('Bunched') || widget.text.startsWith('On time'))
      .map((widget) => [widget.text, widget.widgetValue.value])
  );

describe('headway Bunched and On time shares', () => {
  it('leaves out single-day headways with no scheduled headway', () => {
    const data = [headway(120, 600), headway(600, 600), headway(600, null), headway(30, null)];
    expect(shares(getSingleDayWidgets(data, 'headways'))).toEqual({
      'Bunched (≤50%)': 0.5,
      'On time (±25%)': 0.5,
    });
  });

  it('hides the single-day shares when no headway has a schedule', () => {
    expect(shares(getSingleDayWidgets([headway(600, null)], 'headways'))).toEqual({});
  });

  it('adds up aggregate counts out of scheduled headways', () => {
    const data = [
      day({ count: 100, scheduled: 80, bunched: 8, on_time: 40 }),
      day({ count: 100, scheduled: 0, bunched: 0, on_time: 0 }),
    ];
    expect(shares(getAggHeadwayDataWidgets(data, 'times'))).toEqual({
      'Bunched (≤50%)': 0.1,
      'On time (±25%)': 0.5,
    });
  });

  it('falls back to every headway for responses without scheduled counts', () => {
    const data = [day({ count: 100, bunched: 10, on_time: 50 })];
    expect(shares(getAggHeadwayDataWidgets(data, 'times'))).toEqual({
      'Bunched (≤50%)': 0.1,
      'On time (±25%)': 0.5,
    });
  });

  it('hides the aggregate shares when no day has a schedule', () => {
    const data = [day({ count: 200, scheduled: 0, bunched: 0, on_time: 0 })];
    expect(shares(getAggHeadwayDataWidgets(data, 'times'))).toEqual({});
  });
});

const dated = (
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

const weekday = dated('2026-09-01', 600);
const weekend = dated('2026-09-05', 900, { weekend: true });
const period = getComparisonPeriod('2026-09-01', '2026-10-31', 'year')!;
const lastYear: TripComparison = {
  period,
  data: {
    by_date: [dated('2025-09-02', 500), dated('2025-09-06', 700, { weekend: true })],
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
  const comparisonData = { data: [dated('2025-09-02', 500)], label: 'last year' };

  it('counts a longer travel time as worse', () => {
    const [average] = getAggDataWidgets([weekday], 'times', comparisonData);
    expect(average.comparison).toMatchObject({ delta: 100, unit: 'time', higherIsBetter: false });
  });

  it('counts a higher speed as better, in mph', () => {
    const [average] = getAggDataWidgets([weekday], 'speeds', comparisonData);
    expect(average.comparison).toMatchObject({ unit: 'mph', higherIsBetter: true });
  });

  it('counts more on-time trips as better and more bunched trips as worse', () => {
    const now = dated('2026-09-01', 600, { bunched: 1, on_time: 8 });
    const before = { data: [dated('2025-09-02', 600, { bunched: 3, on_time: 5 })], label: 'x' };
    const widgets = getAggHeadwayDataWidgets([now], 'times', before);
    const onTime = widgets.find((w) => w.text.startsWith('On time'));
    const bunched = widgets.find((w) => w.text.startsWith('Bunched'));
    expect(onTime?.comparison).toMatchObject({ higherIsBetter: true });
    expect(onTime?.comparison?.delta).toBeCloseTo(0.3);
    expect(bunched?.comparison).toMatchObject({ higherIsBetter: false });
  });
});

describe('Median stat', () => {
  const median = (values: number[]) =>
    getAggDataWidgets(
      values.map((value) => day({ '50%': value })),
      'times'
    ).find((widget) => widget.text === 'Median')?.widgetValue.value;

  it('takes the middle value of an odd count', () => {
    expect(median([300])).toBe(300);
    expect(median([500, 300, 400])).toBe(400);
  });

  it('averages the two middle values of an even count', () => {
    expect(median([300, 400])).toBe(350);
    expect(median([100, 400, 300, 200])).toBe(250);
  });
});

describe('On time comparison', () => {
  it('marks a higher on-time share as the better direction', () => {
    const widgets = getAggHeadwayDataWidgets(
      [day({ count: 100, scheduled: 100, bunched: 5, on_time: 80 })],
      'times',
      { data: [day({ count: 100, scheduled: 100, bunched: 5, on_time: 70 })], label: 'weekends' }
    );
    const onTime = widgets.find((widget) => widget.text.startsWith('On time'));
    const bunched = widgets.find((widget) => widget.text.startsWith('Bunched'));
    expect(onTime?.comparison?.higherIsBetter).toBe(true);
    expect(bunched?.comparison?.higherIsBetter).toBeFalsy();
  });
});
