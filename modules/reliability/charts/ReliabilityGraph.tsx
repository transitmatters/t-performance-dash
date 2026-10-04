import React from 'react';
import type { Benchmark, Dataset } from '../../../common/components/charts/TimeSeriesChart';
import { TimeSeriesChart } from '../../../common/components/charts/TimeSeriesChart';
import { NoDataNotice } from '../../../common/components/notices/NoDataNotice';
import type { AggType } from '../../speed/constants/speeds';

interface ReliabilityGraphProps {
  data: Dataset[];
  agg: AggType;
  startDate: string;
  endDate: string;
  kind: 'percent' | 'count';
  valueAxisLabel: string;
  benchmarks?: Benchmark[];
}

/** A line chart of on-time percentages or per-day counts, one line per dataset. */
export const ReliabilityGraph: React.FC<ReliabilityGraphProps> = ({
  data,
  agg,
  startDate,
  endDate,
  kind,
  valueAxisLabel,
  benchmarks,
}) => {
  if (data.every((dataset) => dataset.data.length === 0)) {
    return <NoDataNotice isLineMetric />;
  }
  const format = (value: number) =>
    kind === 'percent' ? `${value.toFixed(1)}%` : Math.round(value).toLocaleString('en-us');
  return (
    <TimeSeriesChart
      data={data}
      valueAxis={{
        min: kind === 'count' ? 0 : undefined,
        max: kind === 'percent' ? 100 : undefined,
        label: valueAxisLabel,
        renderTickLabel: kind === 'percent' ? (value) => `${value}%` : undefined,
      }}
      timeAxis={{ agg, from: startDate, to: endDate }}
      style={{
        pointRadius: agg === 'daily' ? 0 : 2,
        pointHitRadius: 8,
        tooltipLabel: (point, context) => `${context.dataset.label}: ${format(point.value)}`,
      }}
      legend={data.length > 1 ? { visible: true, align: 'end', position: 'top' } : undefined}
      benchmarks={benchmarks}
    />
  );
};
