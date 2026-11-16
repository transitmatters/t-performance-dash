import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { useMemo } from 'react';
import { DATE_FORMAT } from '../constants/dates';
import type { AggregateDataPoint, AggregateDataResponse, PointField } from '../types/charts';
import type {
  AggregateComparisonSeries,
  ComparisonPeriod,
  TripComparison,
} from '../types/comparison';
import { useDelimitatedRoute } from './router';

/** 52 weeks rather than a calendar year, so weekdays line up with weekdays on the chart. */
const DAYS_IN_52_WEEKS = 364;

const isIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && dayjs(value).isValid();

export const formatDateRange = (start: Dayjs, end: Dayjs) =>
  start.year() === end.year()
    ? `${start.format('MMM D')} – ${end.format('MMM D, YYYY')}`
    : `${start.format('MMM D, YYYY')} – ${end.format('MMM D, YYYY')}`;

/**
 * Resolve the `vs` param into a range the same length as startDate–endDate, so the two periods can
 * share one x axis. `previous` is the range just before, `year` is 52 weeks earlier, and a date
 * starts a custom range on that day.
 */
export const getComparisonPeriod = (
  startDate: string | undefined,
  endDate: string | undefined,
  vs: string | undefined
): ComparisonPeriod | undefined => {
  if (!startDate || !endDate || !vs) return undefined;
  if (!isIsoDate(startDate) || !isIsoDate(endDate)) return undefined;
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const lengthDays = end.diff(start, 'day') + 1;
  if (lengthDays < 1) return undefined;

  let option: ComparisonPeriod['option'];
  let offsetDays: number;
  if (vs === 'previous') {
    option = 'previous';
    offsetDays = lengthDays;
  } else if (vs === 'year') {
    option = 'year';
    offsetDays = DAYS_IN_52_WEEKS;
  } else if (isIsoDate(vs)) {
    option = 'custom';
    offsetDays = start.diff(dayjs(vs), 'day');
  } else {
    return undefined;
  }
  if (offsetDays === 0) return undefined;

  const comparisonStart = start.subtract(offsetDays, 'day');
  const comparisonEnd = end.subtract(offsetDays, 'day');
  const rangeLabel = formatDateRange(comparisonStart, comparisonEnd);
  const descriptions: Record<ComparisonPeriod['option'], string> = {
    previous: `the previous period (${rangeLabel})`,
    year: `the same weeks last year (${rangeLabel})`,
    custom: rangeLabel,
  };

  return {
    option,
    startDate: comparisonStart.format(DATE_FORMAT),
    endDate: comparisonEnd.format(DATE_FORMAT),
    offsetDays,
    rangeLabel,
    description: descriptions[option],
  };
};

/** A day on the selected range's axis, as the comparison period's own date ("Sep 3, 2025"). */
export const comparisonDateFor = (date: string, offsetDays: number) =>
  dayjs(date).subtract(offsetDays, 'day').format('MMM D, YYYY');

/** The custom comparison offered first: one calendar year before the selected start. */
export const getDefaultCustomCompareDate = (startDate: string) =>
  dayjs(startDate).subtract(1, 'year').format(DATE_FORMAT);

/**
 * Line two series up on one set of x labels, so Chart.js's index-mode tooltip pairs the right
 * points. Comparison points move forward by offsetDays; a label one series lacks is undefined in it.
 */
export const alignComparisonSeries = (
  primary: AggregateDataPoint[],
  comparison: AggregateDataPoint[],
  pointField: PointField,
  offsetDays: number
) => {
  const shift = (key: string) =>
    offsetDays === 0 ? key : dayjs(key).add(offsetDays, 'day').format(DATE_FORMAT);
  const primaryByKey = new Map<string, AggregateDataPoint>();
  primary.forEach((point) => {
    if (point[pointField]) primaryByKey.set(point[pointField], point);
  });
  const comparisonByKey = new Map<string, AggregateDataPoint>();
  comparison.forEach((point) => {
    if (point[pointField]) comparisonByKey.set(shift(point[pointField]), point);
  });
  const labels = Array.from(new Set([...primaryByKey.keys(), ...comparisonByKey.keys()])).sort();
  return {
    labels,
    primary: labels.map((label) => primaryByKey.get(label)),
    comparison: labels.map((label) => comparisonByKey.get(label)),
  };
};

/** Turn a chart's comparison data into the series it draws, through the same filter as its own data. */
export const getComparisonSeries = (
  comparison: TripComparison | undefined,
  selectData: (response: AggregateDataResponse) => AggregateDataPoint[],
  byDate = true
): AggregateComparisonSeries | undefined => {
  if (!comparison) return undefined;
  const { period, data, isError } = comparison;
  return {
    data: data ? selectData(data) : [],
    label: period.rangeLabel,
    offsetDays: byDate ? period.offsetDays : 0,
    status: isError ? 'error' : data ? 'ready' : 'loading',
  };
};

/** The comparison period the page's `vs` param asks for, if any. */
export const useComparisonPeriod = () => {
  const {
    query: { startDate, endDate, vs },
  } = useDelimitatedRoute();
  return useMemo(() => getComparisonPeriod(startDate, endDate, vs), [startDate, endDate, vs]);
};
