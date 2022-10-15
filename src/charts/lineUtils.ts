import { BenchmarkField, DataPoint, YField } from './types';

export const prettyDate = (dateString: string, with_dow: boolean) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: with_dow ? 'long' : undefined,
  };
  return new Date(`${dateString}T00:00:00`).toLocaleDateString(
    undefined, // user locale/language
    options
  );
};

export const yearLabel = (date1: string, date2: string) => {
  const y1 = date1.split('-')[0];
  const y2 = date2.split('-')[0];
  return y1 === y2 ? y1 : `${y1} – ${y2}`;
};

export const departure_from_normal_string = (metric: number, benchmark: number) => {
  const ratio = metric / benchmark;
  if (!isFinite(ratio) || ratio <= 1.25) {
    return '';
  } else if (ratio <= 1.5) {
    return '>25% longer than normal';
  } else if (ratio <= 2.0) {
    return '>50% longer than normal';
  } else if (ratio > 2.0) {
    return '>100% longer than normal';
  }
};

export const point_colors = (
  data: DataPoint[],
  metric_field: YField,
  benchmark_field: BenchmarkField
) => {
  return data.map((point) => {
    if (benchmark_field === null) {
      return '#1c1c1c'; //grey
    }

    const ratio = point[metric_field] / point[benchmark_field];
    if (point[benchmark_field] === null) {
      return '#1c1c1c'; //grey
    } else if (ratio <= 1.25) {
      return '#64b96a'; //green
    } else if (ratio <= 1.5) {
      return '#f5ed00'; //yellow
    } else if (ratio <= 2.0) {
      return '#c33149'; //red
    } else if (ratio > 2.0) {
      return '#bb5cc1'; //purple
    }

    return '#1c1c1c'; //whatever
  });
};
