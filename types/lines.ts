import { TimeUnit } from 'chart.js';
import React from 'react';
import {
  AggregateDataPoint,
  BenchmarkField,
  MetricField,
  PointField,
  SingleDayDataPoint,
} from '../src/charts/types';

export interface LineProps {
  title: string;
  chartId: string;
  location: any;
  isLoading: any;
  pointField: PointField; // X value
  bothStops?: boolean;
  fname: any;
  showLegend: boolean;
}

export interface AggregateLineProps extends LineProps {
  timeUnit: TimeUnit;
  data: AggregateDataPoint[];
  timeFormat: string;
  seriesName: string;
  fillColor: any;
  startDate: string;
  endDate: string;
  suggestedYMin?: number;
  suggestedYMax?: number;
  children?: React.ReactNode;
}

export interface SingleDayLineProps extends LineProps {
  data: SingleDayDataPoint[];
  metricField: MetricField; // Y value
  date: string;
  benchmarkField?: BenchmarkField;
}
