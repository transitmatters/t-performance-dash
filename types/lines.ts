import { TimeUnit } from 'chart.js';
import React from 'react';
import {
  AggregateDataPoint,
  BenchmarkField,
  MetricField,
  PointField,
  SingleDayDataPoint,
  Location,
} from './charts';

export type Line = 'RL' | 'OL' | 'GL' | 'BL' | 'BUS';
export type LineShort = 'Red' | 'Orange' | 'Green' | 'Blue' | 'Bus';
export type LinePath = 'red' | 'orange' | 'green' | 'blue' | 'bus';
export type LineMetadata = {
  name: string;
  color: string;
  short: LineShort;
  path: LinePath;
  key: Line;
};
export type LineObject = { [key in Line]: LineMetadata };

type DataName = 'traveltimes' | 'headways' | 'dwells' | 'traveltimesByHour';

export interface LineProps {
  title: string;
  chartId: string;
  location: Location;
  isLoading: any;
  pointField: PointField; // X value
  bothStops?: boolean;
  fname: DataName;
  showLegend?: boolean;
}

export interface AggregateLineProps extends LineProps {
  timeUnit: TimeUnit;
  data: AggregateDataPoint[];
  timeFormat: string;
  seriesName: string;
  fillColor: string;
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
