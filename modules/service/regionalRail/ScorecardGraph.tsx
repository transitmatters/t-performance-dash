import { useRef } from 'react';
import type { ComponentProps } from 'react';
import type { Benchmark, Dataset } from '../../../common/components/charts/TimeSeriesChart';
import { TimeSeriesChart } from '../../../common/components/charts/TimeSeriesChart';
import { getLabelsForData } from '../../../common/components/charts/TimeSeriesChart/helpers';
import { NoDataNotice } from '../../../common/components/notices/NoDataNotice';
import { ByHourHistogram } from '../../../common/components/charts/ByHourHistogram';
import { ChartStack } from '../../../common/components/charts/ChartStack';
import { ChartActions } from '../../../common/components/charts/ChartActions';
import type { ChartDatasetName } from '../../../common/utils/chartTitles';
import type { AggType } from '../../speed/constants/speeds';
import { getNoDataSinceLatestBlock } from '../utils/graphUtils';

interface ScorecardGraphProps {
  data: Dataset[];
  agg: AggType;
  startDate: string;
  endDate: string;
  valueAxisLabel: string;
  format: (value: number) => string;
  max?: number;
  benchmark?: Benchmark;
  /** Names the chart's PNG. */
  datasetName: ChartDatasetName;
}

/** One line per direction over time, against the Regional Rail target. */
export const ScorecardGraph = ({
  data,
  agg,
  startDate,
  endDate,
  valueAxisLabel,
  format,
  max,
  benchmark,
  datasetName,
}: ScorecardGraphProps) => {
  const ref = useRef(null);
  if (data.every((dataset) => dataset.data.length === 0)) {
    return <NoDataNotice isLineMetric shutdownScope="line" />;
  }
  return (
    <ChartStack>
      <TimeSeriesChart
        chartRef={ref}
        data={data}
        valueAxis={{ min: 0, max, label: valueAxisLabel }}
        timeAxis={{ agg, from: startDate, to: endDate }}
        style={{
          pointRadius: agg === 'daily' ? 0 : 2,
          pointHitRadius: 8,
          tooltipLabel: (point, context) =>
            `${context.dataset.label}: ${point.value == null ? '—' : format(point.value)}`,
        }}
        blocks={getNoDataSinceLatestBlock(getLabelsForData(data))}
        legend={data.length > 1 ? { visible: true, align: 'end', position: 'top' } : undefined}
        benchmarks={benchmark ? [benchmark] : undefined}
      />
      <ChartActions
        datasetName={datasetName}
        chartRef={ref}
        startDate={startDate}
        endDate={endDate}
      />
    </ChartStack>
  );
};

/** Trains by hour on an average day, with its action row. */
export const ScorecardByHour = ({
  data,
  valueAxis,
  startDate,
  endDate,
}: Pick<ComponentProps<typeof ByHourHistogram>, 'data' | 'valueAxis'> & {
  startDate: string;
  endDate: string;
}) => {
  const ref = useRef(null);
  return (
    <ChartStack>
      <ByHourHistogram data={data} valueAxis={valueAxis} chartRef={ref} />
      <ChartActions
        datasetName="cr-trains-by-hour"
        chartRef={ref}
        startDate={startDate}
        endDate={endDate}
      />
    </ChartStack>
  );
};
