import { useRef } from 'react';
import { Bar } from '@chartjs-components';

import { useDelimitatedRoute } from '../../../common/utils/router';
import { SEVERITY_COLORS, useChartTheme } from '../../../common/utils/chartTheme';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import { ChartStack } from '../../../common/components/charts/ChartStack';
import { ChartActions } from '../../../common/components/charts/ChartActions';
import { ChartDiv } from '../../../common/components/charts/ChartDiv';
import { NoDataNotice } from '../../../common/components/notices/NoDataNotice';
import type { AggType } from '../../speed/constants/speeds';
import type { HeadwayRow } from '../utils';
import {
  divergingShares,
  formatPercent,
  HEADWAY_BUCKETS,
  headwayShare,
  OFF_SCHEDULE_BUCKETS,
} from '../utils';
import { periodName, periodTimeScale, periodTitle } from './timeAxis';

interface OffScheduleDivergingBarsProps {
  rows: HeadwayRow[];
  agg: AggType;
  startDate: string;
  endDate: string;
}

// Nearest the axis first, so the extremes (bunched, long gaps) sit at the ends of each bar
const STACK_ORDER = [
  'headways_50_75',
  'headways_under_50',
  'headways_125_150',
  'headways_over_150',
];
const STACKED = STACK_ORDER.map((field) =>
  OFF_SCHEDULE_BUCKETS.find((bucket) => bucket.field === field)!
);
const LEGEND = [
  { text: 'Bunched or long gap', color: SEVERITY_COLORS.off50 },
  { text: 'Short or long', color: SEVERITY_COLORS.off25 },
];
// Hover rows read top to bottom, the way the bar is drawn
const HOVER_ORDER = [...HEADWAY_BUCKETS].reverse();

/**
 * Each period's off-schedule headways as one bar split at zero: longer than scheduled above the
 * axis, shorter than scheduled (bunching) below it. Comparing the two halves shows which problem a
 * line has, and how it changed.
 */
export const OffScheduleDivergingBars = ({
  rows,
  agg,
  startDate,
  endDate,
}: OffScheduleDivergingBarsProps) => {
  const { linePath } = useDelimitatedRoute();
  const ref = useRef(null);
  const chartTheme = useChartTheme();
  const isMobile = !useBreakpoint('md');
  const datasets = STACKED.map((bucket) => ({ bucket, values: divergingShares(rows, bucket) }));

  const above = rows.map((_, i) =>
    datasets.reduce((t, { values }) => t + Math.max(0, values[i] ?? 0), 0)
  );
  const below = rows.map((_, i) =>
    datasets.reduce((t, { values }) => t - Math.min(0, values[i] ?? 0), 0)
  );
  const extent = Math.max(0, ...above, ...below);
  if (!extent) return <NoDataNotice isLineMetric />;
  // The same scale both ways, so a taller half means more of that problem
  // and a whole number of steps each way, so zero is always a tick
  const step = extent > 40 ? 20 : 10;
  const bound = Math.min(100, Math.ceil(extent / step) * step);

  return (
    <ChartStack>
      <ChartDiv isMobile={isMobile}>
        <Bar
          id={`reliabilityDiverging-${linePath}`}
          role="img"
          aria-label={`Share of headways longer and shorter than scheduled, per ${periodName(agg)}`}
          ref={ref}
          data={{
            labels: rows.map((row) => row.date),
            datasets: datasets.map(({ bucket, values }) => ({
              label: bucket.label,
              data: values,
              backgroundColor: bucket.color,
              barPercentage: 0.9,
              categoryPercentage: 1,
              borderRadius: 2,
              borderSkipped: false,
            })),
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: 'index' },
            plugins: {
              legend: {
                display: true,
                position: 'bottom',
                onClick: () => undefined,
                labels: {
                  boxWidth: 12,
                  color: chartTheme.tick,
                  // Each color is used on both sides of the axis, so name it once
                  generateLabels: () =>
                    LEGEND.map(({ text, color }) => ({
                      text,
                      fillStyle: color,
                      strokeStyle: color,
                      fontColor: chartTheme.tick,
                      lineWidth: 0,
                    })),
                },
              },
              tooltip: {
                callbacks: {
                  title: (items) => periodTitle(agg, items[0]?.label),
                  hoverCard: (items) => {
                    const counts = rows[items[0]?.dataIndex]?.counts;
                    if (!counts) return null;
                    return {
                      rows: HOVER_ORDER.map(({ field, label, range, color }) => ({
                        label: `${label} (${range})`,
                        value: formatPercent(headwayShare(counts, [field])),
                        color,
                      })),
                    };
                  },
                },
              },
            },
            scales: {
              y: {
                stacked: true,
                min: -bound,
                max: bound,
                border: { display: false },
                grid: {
                  // A firmer rule at zero, where the two halves meet
                  color: (context) =>
                    context.tick?.value === 0 ? chartTheme.axisBorder : chartTheme.grid,
                  lineWidth: (context) => (context.tick?.value === 0 ? 1.5 : 1),
                },
                ticks: {
                  color: chartTheme.tick,
                  stepSize: step,
                  callback: (value) => `${Math.abs(Number(value))}%`,
                },
                // Rotated, so the arrows point down to bunching and up to long gaps
                title: { display: true, text: '← Shorter · Longer →', color: chartTheme.tick },
              },
              x: periodTimeScale(agg, startDate, endDate, chartTheme),
            },
          }}
        />
      </ChartDiv>
      <ChartActions
        datasetName="reliability-off-schedule"
        chartRef={ref}
        startDate={startDate}
        endDate={endDate}
      />
    </ChartStack>
  );
};
