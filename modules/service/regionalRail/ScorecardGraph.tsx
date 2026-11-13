import { useRef } from 'react';
import type { ComponentProps } from 'react';
import type { Benchmark, Dataset } from '../../../common/components/charts/TimeSeriesChart';
import { TimeSeriesChart } from '../../../common/components/charts/TimeSeriesChart';
import { getLabelsForData } from '../../../common/components/charts/TimeSeriesChart/helpers';
import { NoDataNotice } from '../../../common/components/notices/NoDataNotice';
import { ChartStack } from '../../../common/components/charts/ChartStack';
import { ChartActions } from '../../../common/components/charts/ChartActions';
import type { ChartDatasetName } from '../../../common/utils/chartTitles';
import type { AggType } from '../../speed/constants/speeds';
import { CHART_COLORS, LINE_COLORS, LINE_COLORS_ON_DARK } from '../../../common/constants/colors';
import { hexWithAlpha } from '../../../common/utils/general';
import { getNoDataSinceLatestBlock } from '../utils/graphUtils';

const CR = LINE_COLORS['line-commuter-rail'];
const CR_LIGHT = LINE_COLORS_ON_DARK['line-commuter-rail'];

/** Both directions in Commuter Rail purple, inbound a lighter shade, each lightly filled. */
export const DIRECTION_STYLES = {
  outbound: { color: CR, fillColor: hexWithAlpha(CR, 0.15), fillPattern: 'solid' as const },
  inbound: {
    color: CR_LIGHT,
    fillColor: hexWithAlpha(CR_LIGHT, 0.15),
    fillPattern: 'solid' as const,
  },
};

export const REVERSE_PEAK_STYLE = { color: CHART_COLORS.YELLOW, width: 1 };

interface ScorecardGraphProps {
  data: Dataset[];
  agg: AggType;
  startDate: string;
  endDate: string;
  valueAxisLabel: string;
  format: (value: number) => string;
  max?: number;
  benchmark?: Benchmark;
  /** Names the chart's PNG and CSV. */
  datasetName: ChartDatasetName;
  csv?: ComponentProps<typeof ChartActions>['csv'];
}

/** One stepped line per direction over time, against the Regional Rail target. */
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
  csv,
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
          stepped: true,
          pointRadius: 0,
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
        csv={csv}
        startDate={startDate}
        endDate={endDate}
      />
    </ChartStack>
  );
};
