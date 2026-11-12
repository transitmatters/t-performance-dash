import { useRef } from 'react';
import { Bar } from '@chartjs-components';

import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import { useChartTheme } from '../../../common/utils/chartTheme';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import { watermarkLayout } from '../../../common/constants/charts';
import { LINE_COLORS } from '../../../common/constants/colors';
import type { Line } from '../../../common/types/lines';
import { ChartStack } from '../../../common/components/charts/ChartStack';
import { ChartDiv } from '../../../common/components/charts/ChartDiv';
import { SaveChartImageButton } from '../../../common/components/buttons/SaveChartImageButton';
import { NoDataNotice } from '../../../common/components/notices/NoDataNotice';
import type { AggType } from '../../speed/constants/speeds';
import type { EttRow } from '../excessTripTime';
import { excessTravel, excessTripTime, excessWait, formatMinutes } from '../excessTripTime';
import { periodName, periodTimeScale, periodTitle } from './timeAxis';

interface ExcessTimeBarsProps {
  rows: EttRow[];
  line: Line;
  agg: AggType;
  startDate: string;
  endDate: string;
}

const minutes = (total: number, riders: number) => `${(total / riders).toFixed(1)} min`;

/**
 * Each period's excess trip time per rider as one bar, split into excess wait (from gaps between
 * trains) and excess travel (from slow running and long dwells). Either can dip below zero when
 * trains beat the baseline, so the bar is split at the axis.
 */
export const ExcessTimeBars = ({ rows, line, agg, startDate, endDate }: ExcessTimeBarsProps) => {
  const ref = useRef(null);
  const chartTheme = useChartTheme();
  const isMobile = !useBreakpoint('md');
  // Wait in a light tint of the line's color, travel in the color itself, so the two parts read
  // apart by lightness on every line
  const travelColor = LINE_COLORS[line];
  const waitColor = `${travelColor}73`;
  const datasets = [
    { label: 'Excess wait', color: waitColor, values: rows.map((row) => excessWait(row.sums)) },
    {
      label: 'Excess travel',
      color: travelColor,
      values: rows.map((row) => excessTravel(row.sums)),
    },
  ];
  if (datasets.every(({ values }) => values.every((v) => v == null))) {
    return <NoDataNotice isLineMetric />;
  }

  return (
    <ChartStack>
      <ChartDiv isMobile={isMobile}>
        <Bar
          id={`excessTripTime-${line}`}
          role="img"
          aria-label={`Excess wait and travel minutes per rider, per ${periodName(agg)}`}
          ref={ref}
          data={{
            labels: rows.map((row) => row.date),
            datasets: datasets.map(({ label, color, values }) => ({
              label,
              data: values.map((v) => v ?? null),
              backgroundColor: color,
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
            // @ts-expect-error The watermark plugin doesn't have typescript support
            watermark: watermarkLayout(isMobile),
            plugins: {
              legend: {
                display: true,
                position: 'bottom',
                onClick: () => undefined,
                labels: { boxWidth: 12, color: chartTheme.tick },
              },
              tooltip: {
                callbacks: {
                  title: (items) => periodTitle(agg, items[0]?.label),
                  hoverCard: (items) => {
                    const sums = rows[items[0]?.dataIndex]?.sums;
                    if (!sums?.riders) return null;
                    const { riders } = sums;
                    return {
                      hero: {
                        value: formatMinutes(excessTripTime(sums)),
                        unit: 'min',
                        caption: 'Excess trip time per rider',
                      },
                      rows: [
                        {
                          label: 'Excess wait',
                          value: `${formatMinutes(excessWait(sums))} min`,
                          detail: `Waited ${minutes(sums.waitTime, riders)}, baseline ${minutes(sums.baselineWaitTime, riders)}`,
                          color: waitColor,
                        },
                        {
                          label: 'Excess travel',
                          value: `${formatMinutes(excessTravel(sums))} min`,
                          detail: `On board ${minutes(sums.travelTime, riders)}, baseline ${minutes(sums.baselineTravelTime, riders)}`,
                          color: travelColor,
                        },
                      ],
                    };
                  },
                },
              },
            },
            scales: {
              y: {
                stacked: true,
                border: { display: false },
                grid: {
                  // A firmer rule at zero, where trips match the baseline
                  color: (context) =>
                    context.tick?.value === 0 ? chartTheme.axisBorder : chartTheme.grid,
                  lineWidth: (context) => (context.tick?.value === 0 ? 1.5 : 1),
                },
                ticks: {
                  color: chartTheme.tick,
                  // A real minus sign, as in the stat cards and hover card
                  callback: (value) => `${String(value).replace('-', '−')} min`,
                },
                title: { display: true, text: 'Minutes over baseline', color: chartTheme.tick },
              },
              x: periodTimeScale(agg, startDate, endDate, chartTheme),
            },
          }}
          plugins={[ChartjsPluginWatermark]}
        />
      </ChartDiv>
      <div className="flex flex-row items-end justify-end gap-4">
        <SaveChartImageButton
          chartRef={ref}
          datasetName="reliability-excess-trip-time"
          includeBothStopsForLocation={false}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
    </ChartStack>
  );
};
