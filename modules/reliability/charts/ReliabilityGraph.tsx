import { useRef } from 'react';
import type { Benchmark, Dataset } from '../../../common/components/charts/TimeSeriesChart';
import { TimeSeriesChart } from '../../../common/components/charts/TimeSeriesChart';
import { getLabelsForData } from '../../../common/components/charts/TimeSeriesChart/helpers';
import { CHART_COLORS, LINE_COLORS, LINE_COLORS_DARK } from '../../../common/constants/colors';
import type { Line, LineColorKey } from '../../../common/types/lines';
import { useLineColorKey } from '../../../common/utils/router';
import { NoDataNotice } from '../../../common/components/notices/NoDataNotice';
import { ChartStack } from '../../../common/components/charts/ChartStack';
import { ChartActions } from '../../../common/components/charts/ChartActions';
import type { ChartDatasetName } from '../../../common/utils/chartTitles';
import type { AggType } from '../../speed/constants/speeds';
import { getNoDataSinceLatestBlock } from '../../service/utils/graphUtils';

interface ReliabilityGraphProps {
  // Headline series first: it's drawn filled, the rest as lines over it
  data: Dataset[];
  line: Line;
  agg: AggType;
  startDate: string;
  endDate: string;
  kind: 'percent' | 'count';
  valueAxisLabel: string;
  benchmarks?: Benchmark[];
  /** Names the chart's PNG; without it the chart has no action row, as on an overview. */
  datasetName?: ChartDatasetName;
}

// Colors by position, in the line's own shades like the other v5 charts
const seriesStyle = (colorKey: LineColorKey, index: number) =>
  index === 0
    ? { color: LINE_COLORS[colorKey], fill: true }
    : { color: index === 1 ? LINE_COLORS_DARK[colorKey] : CHART_COLORS.ANNOTATIONS };

/** A stepped chart of on-time percentages or per-day counts, one series per dataset. */
export const ReliabilityGraph = ({
  data,
  line,
  agg,
  startDate,
  endDate,
  kind,
  valueAxisLabel,
  benchmarks,
  datasetName,
}: ReliabilityGraphProps) => {
  const colorKey = useLineColorKey(line) ?? line;
  const ref = useRef(null);
  if (data.every((dataset) => dataset.data.length === 0)) {
    return <NoDataNotice isLineMetric />;
  }
  const format = (value: number) =>
    kind === 'percent' ? `${value.toFixed(1)}%` : Math.round(value).toLocaleString('en-us');
  const chart = (
    <TimeSeriesChart
      chartRef={ref}
      data={data.map((dataset, index) => ({
        ...dataset,
        style: { ...seriesStyle(colorKey, index), ...dataset.style },
      }))}
      valueAxis={{
        min: 0,
        max: kind === 'percent' ? 100 : undefined,
        label: valueAxisLabel,
        renderTickLabel: kind === 'percent' ? (value) => `${value}%` : undefined,
      }}
      timeAxis={{ agg, from: startDate, to: endDate }}
      style={{
        stepped: true,
        pointHitRadius: 8,
        tooltipLabel: (point, context) =>
          `${context.dataset.label}: ${point.value == null ? '—' : format(point.value)}`,
      }}
      blocks={getNoDataSinceLatestBlock(getLabelsForData(data))}
      legend={data.length > 1 ? { visible: true, align: 'end', position: 'top' } : undefined}
      benchmarks={benchmarks}
    />
  );
  if (!datasetName) return chart;
  return (
    <ChartStack>
      {chart}
      <ChartActions
        datasetName={datasetName}
        chartRef={ref}
        startDate={startDate}
        endDate={endDate}
      />
    </ChartStack>
  );
};
