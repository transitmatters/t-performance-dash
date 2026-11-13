import { useRef } from 'react';
import { Bar } from '@chartjs-components';

import { useDelimitatedRoute } from '../../../common/utils/router';
import { LINE_COLORS } from '../../../common/constants/colors';
import { useChartTheme } from '../../../common/utils/chartTheme';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import { ChartStack } from '../../../common/components/charts/ChartStack';
import { ChartActions } from '../../../common/components/charts/ChartActions';
import { ChartDiv } from '../../../common/components/charts/ChartDiv';
import { NoDataNotice } from '../../../common/components/notices/NoDataNotice';
import type { AggType } from '../../speed/constants/speeds';
import type { HeadwayRow } from '../utils';
import {
  formatCount,
  formatPercent,
  headwayCount,
  headwayShare,
  OFF_SCHEDULE_BUCKETS,
  ON_TIME,
  toCsvRows,
} from '../utils';
import { periodName, periodTimeScale, periodTitle } from './timeAxis';

interface OnTimeBarsProps {
  rows: HeadwayRow[];
  agg: AggType;
  startDate: string;
  endDate: string;
}

/** One bar per period: the share of headways on time: within 25% of the scheduled headway. */
export const OnTimeBars = ({ rows, agg, startDate, endDate }: OnTimeBarsProps) => {
  const { colorKey, linePath } = useDelimitatedRoute();
  const ref = useRef(null);
  const chartTheme = useChartTheme();
  const isMobile = !useBreakpoint('md');
  const lineColor = LINE_COLORS[colorKey ?? 'default'];
  const shares = rows.map((row) => headwayShare(row.counts, ON_TIME) ?? null);

  if (shares.every((share) => share == null)) return <NoDataNotice isLineMetric />;

  return (
    <ChartStack>
      <ChartDiv isMobile={isMobile}>
        <Bar
          id={`reliabilityOnTime-${linePath}`}
          role="img"
          aria-label={`Share of headways on time, per ${periodName(agg)}`}
          ref={ref}
          data={{
            labels: rows.map((row) => row.date),
            datasets: [
              {
                label: 'On time',
                data: shares,
                backgroundColor: lineColor,
                barPercentage: 0.9,
                categoryPercentage: 1,
                borderRadius: 2,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: 'index' },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  title: (items) => periodTitle(agg, items[0]?.label),
                  hoverCard: (items) => {
                    const counts = rows[items[0]?.dataIndex]?.counts;
                    if (!counts) return null;
                    return {
                      hero: {
                        value: formatPercent(headwayShare(counts, ON_TIME)),
                        caption: 'On time',
                        color: lineColor,
                      },
                      rows: [
                        ...OFF_SCHEDULE_BUCKETS.map(({ field, label, range, color }) => ({
                          label: `${label} (${range})`,
                          value: formatPercent(headwayShare(counts, [field])),
                          color,
                        })),
                        { label: 'Headways measured', value: formatCount(headwayCount(counts)) },
                      ],
                    };
                  },
                },
              },
            },
            scales: {
              y: {
                min: 0,
                max: 100,
                border: { display: false },
                grid: { color: chartTheme.grid },
                ticks: { color: chartTheme.tick, callback: (value) => `${value}%` },
                title: { display: true, text: 'On time', color: chartTheme.tick },
              },
              x: periodTimeScale(agg, startDate, endDate, chartTheme),
            },
          }}
        />
      </ChartDiv>
      <ChartActions
        datasetName="reliability-on-time"
        chartRef={ref}
        csv={toCsvRows(rows)}
        csvName="reliability-headways"
        startDate={startDate}
        endDate={endDate}
      />
    </ChartStack>
  );
};
