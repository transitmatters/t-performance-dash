import React from 'react';
import type { Benchmark, Dataset } from '../../../common/components/charts/TimeSeriesChart';
import { TimeSeriesChart } from '../../../common/components/charts/TimeSeriesChart';
import { NoDataNotice } from '../../../common/components/notices/NoDataNotice';
import type { AggType } from '../../speed/constants/speeds';

interface ScorecardGraphProps {
  data: Dataset[];
  agg: AggType;
  startDate: string;
  endDate: string;
  valueAxisLabel: string;
  format: (value: number) => string;
  max?: number;
  benchmark?: Benchmark;
}

/** One line per direction over time, against the Regional Rail target. */
export const ScorecardGraph: React.FC<ScorecardGraphProps> = ({
  data,
  agg,
  startDate,
  endDate,
  valueAxisLabel,
  format,
  max,
  benchmark,
}) => {
  if (data.every((dataset) => dataset.data.length === 0)) {
    return <NoDataNotice isLineMetric />;
  }
  return (
    <TimeSeriesChart
      data={data}
      valueAxis={{ min: 0, max, label: valueAxisLabel }}
      timeAxis={{ agg, from: startDate, to: endDate }}
      style={{
        pointRadius: agg === 'daily' ? 0 : 2,
        pointHitRadius: 8,
        tooltipLabel: (point, context) => `${context.dataset.label}: ${format(point.value)}`,
      }}
      legend={data.length > 1 ? { visible: true, align: 'end', position: 'top' } : undefined}
      benchmarks={benchmark ? [benchmark] : undefined}
    />
  );
};
