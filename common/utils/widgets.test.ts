import { describe, expect, it } from 'vitest';

import type { AggregateDataPoint, SingleDayDataPoint } from '../types/charts';
import { getAggHeadwayDataWidgets, getSingleDayWidgets } from './widgets';

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
