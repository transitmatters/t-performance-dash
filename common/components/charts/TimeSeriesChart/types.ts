import type { ChartDataset } from 'chart.js';
import type { AggType } from '../../../../modules/speed/constants/speeds';

export type DataPoint = ({ date: string } | { time: string }) & { value: number };

type ResolvedFromDataPoint<
  Applied extends boolean,
  Point extends DataPoint,
  ReturnType = string,
> = Applied extends true ? ReturnType[] : { byPoint: (point: Point) => ReturnType };

type FillPattern = 'solid' | 'slightly-transparent' | 'striped';

export type DisplayStyle<Point extends DataPoint, Applied extends boolean = false> = {
  color: string;
  width: number;
  fill?: boolean; // Use to fill with lineColor by default
  bar?: boolean; // Draw as one bar per point instead of a line
  fillColor: null | string;
  fillPattern: FillPattern;
  pointColor: null | string | ResolvedFromDataPoint<Applied, Point>;
  pointRadius: number;
  pointHitRadius: number;
  tooltipLabel: (
    point: Point,
    context: {
      datasetIndex: number;
      dataIndex: number;
      dataset: ChartDataset;
    }
  ) => string;
  stepped: boolean;
  tension: number;
};

export type AppliedDisplayStyle<Point extends DataPoint> = DisplayStyle<Point, true>;

export type Granularity = 'time' | 'day' | 'week' | 'month';
type AxisUnit = 'day' | 'month' | 'year';

export type ProvidedTimeAxis = {
  label: string;
  format?: string;
  tooltipFormat?: string;
  axisUnit?: AxisUnit;
  from?: string;
  to?: string;
} & ({ granularity: Granularity } | { agg: AggType });

export type ResolvedTimeAxis = {
  granularity: Granularity;
  label: string;
  axisUnit?: AxisUnit;
  format?: string;
  tooltipFormat?: string;
  from?: string;
  to?: string;
};

export type ValueAxis = {
  renderTickLabel?: (value: number) => string;
  label?: null | string;
  min?: number;
  max?: number;
};

export type LegendOptions = {
  visible: boolean;
  position?: 'top' | 'bottom';
  align?: 'start' | 'center' | 'end';
};

export type GridOptions = {
  zIndex?: number;
};

export type Dataset<Point extends DataPoint = DataPoint> = {
  data: Point[];
  label: string;
  style?: Partial<DisplayStyle<Point>>;
};

export type Benchmark = {
  label: string;
  value: number;
  color?: string;
  // Labels the line on the chart and tints the side of it that meets the target
  goodSide?: 'above' | 'below';
};

export type Block = {
  from: string;
  to: string;
  label?: string;
  fillColor?: string;
  textColor?: string;
};
