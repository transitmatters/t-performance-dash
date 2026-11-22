import { useRef } from 'react';
import { Line } from '@chartjs-components';

import { useLinePage } from '../../../common/hooks/usePageParams';
import { useChartTheme } from '../../../common/utils/chartTheme';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import { ChartStack } from '../../../common/components/charts/ChartStack';
import { ChartActions } from '../../../common/components/charts/ChartActions';
import { ChartDiv } from '../../../common/components/charts/ChartDiv';
import { NoDataNotice } from '../../../common/components/notices/NoDataNotice';
import type { AggType } from '../../speed/constants/speeds';
import type { HeadwayRow } from '../utils';
import {
  BUNCHED,
  bucketColor,
  formatPercent,
  HEADWAY_BUCKETS,
  headwayShare,
  LONG_GAP,
} from '../utils';
import { periodName, periodTimeScale, periodTitle } from './timeAxis';

interface BunchingAndGapsLinesProps {
  rows: HeadwayRow[];
  agg: AggType;
  startDate: string;
  endDate: string;
}

// The dash is for those who can't tell red from purple
const SERIES = [
  {
    label: 'Long gaps (≥150%)',
    fields: LONG_GAP,
    get color() {
      return bucketColor('headways_over_150');
    },
    dash: [],
  },
  {
    label: 'Bunched (≤50%)',
    fields: BUNCHED,
    get color() {
      return bucketColor('headways_under_50');
    },
    dash: [6, 4],
  },
];

/** Each period's share of headways that were long gaps, and the share bunched, as two lines. */
export const BunchingAndGapsLines = ({
  rows,
  agg,
  startDate,
  endDate,
}: BunchingAndGapsLinesProps) => {
  const { linePath } = useLinePage();
  const ref = useRef(null);
  const chartTheme = useChartTheme();
  const isMobile = !useBreakpoint('md');
  const series = SERIES.map((s) => ({
    ...s,
    values: rows.map((row) => headwayShare(row.counts, s.fields) ?? null),
  }));

  const highest = Math.max(0, ...series.flatMap(({ values }) => values.map((v) => v ?? 0)));
  if (series.every(({ values }) => values.every((v) => v == null))) {
    return <NoDataNotice isLineMetric />;
  }
  const step = highest > 40 ? 20 : 10;
  const max = Math.min(100, Math.max(step, Math.ceil(highest / step) * step));

  return (
    <ChartStack>
      <ChartDiv isMobile={isMobile}>
        <Line
          id={`reliabilityBunchingGaps-${linePath}`}
          role="img"
          aria-label={`Share of headways that were long gaps and share bunched, per ${periodName(agg)}`}
          ref={ref}
          data={{
            labels: rows.map((row) => row.date),
            datasets: series.map(({ label, values, color, dash }) => ({
              label,
              data: values,
              borderColor: color,
              backgroundColor: color,
              borderDash: dash,
              borderWidth: 2,
              pointRadius: rows.length > 60 ? 0 : 2,
              pointHoverRadius: 4,
              pointHitRadius: 8,
              tension: 0.1,
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
                labels: {
                  boxWidth: 24,
                  boxHeight: 0,
                  color: chartTheme.tick,
                  useBorderRadius: false,
                },
              },
              tooltip: {
                callbacks: {
                  title: (items) => periodTitle(agg, items[0]?.label),
                  // Every bucket, so the card adds up to 100%
                  hoverCard: (items) => {
                    const counts = rows[items[0]?.dataIndex]?.counts;
                    if (!counts) return null;
                    return {
                      rows: HEADWAY_BUCKETS.map(({ field, label, range, color }) => ({
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
                min: 0,
                max,
                border: { display: false },
                grid: { color: chartTheme.grid },
                ticks: {
                  color: chartTheme.tick,
                  stepSize: step,
                  callback: (value) => `${value}%`,
                },
                title: { display: true, text: 'Share of headways', color: chartTheme.tick },
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
