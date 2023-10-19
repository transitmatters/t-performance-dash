import type { ChartDataset } from 'chart.js';

export type DataPoint = ({ date: string } | { time: string }) & { value: number };

type ResolvedFromDataPoint<
  Applied extends boolean,
  Point extends DataPoint,
  ReturnType = string,
> = Applied extends true ? ReturnType[] : { byPoint: (point: Point) => ReturnType };

type FillPattern = 'solid' | 'striped';

export type DisplayStyle<Point extends DataPoint, Applied extends boolean = false> = {
  color: string;
  width: number;
  fill?: boolean; // Use to fill with lineColor by default
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

export type Granularity = 'time' | 'day' | 'week' | 'month' | 'year';

export type TimeAxis = {
  granularity: Granularity;
  label: string;
  format?: string;
  tooltipFormat?: string;
};

export type ValueAxis = {
  label: string;
  min?: number;
  max?: number;
};

export type LegendOptions = {
  visible: boolean;
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
};

export type Block = {
  from: string;
  to: string;
  label?: string;
  fillColor?: string;
  textColor?: string;
};
