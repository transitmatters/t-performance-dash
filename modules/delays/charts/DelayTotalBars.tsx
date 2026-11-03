import { useRef } from 'react';
import { Bar } from '@chartjs-components';

import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';

import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { LINE_COLORS } from '../../../common/constants/colors';
import { useChartTheme } from '../../../common/utils/chartTheme';
import { hexWithAlpha } from '../../../common/utils/general';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import { watermarkLayout } from '../../../common/constants/charts';
import { ChartStack } from '../../../common/components/charts/ChartStack';
import { ChartDiv } from '../../../common/components/charts/ChartDiv';
import { DownloadButton } from '../../../common/components/buttons/DownloadButton';
import { SaveChartImageButton } from '../../../common/components/buttons/SaveChartImageButton';
import type { LineDelays } from '../../../common/types/delays';
import { getFormattedTimeString } from '../../../common/utils/time';
import type { DelayReasonKey } from '../constants/reasons';
import { REASON_BY_KEY, reasonLabel } from '../constants/reasons';
import { hideZeroUnlessAllZero } from '../../../common/components/charts/hoverCard/external';

interface DelayTotalBarsProps {
  data: LineDelays[];
  startDate: string;
  endDate: string;
  agg: 'daily' | 'weekly';
  focus: DelayReasonKey | null;
}

export const DelayTotalBars = ({ data, startDate, endDate, agg, focus }: DelayTotalBarsProps) => {
  const { line, linePath } = useDelimitatedRoute();
  const ref = useRef(null);
  const chartTheme = useChartTheme();
  const isMobile = !useBreakpoint('md');
  const lineColor = LINE_COLORS[line ?? 'default'];
  const period = agg === 'weekly' ? 'week' : 'day';

  const labels = data.map((point) => point.date);
  const totals = data.map((point) => point.total_delay_time);
  const reason = focus ? REASON_BY_KEY[focus] : null;

  const bar = { barPercentage: 0.9, categoryPercentage: 1, borderRadius: 2 };
  const datasets = reason
    ? [
        {
          ...bar,
          label: reasonLabel(reason, line),
          backgroundColor: reason.color,
          data: data.map((point) => point[reason.key]),
        },
        {
          ...bar,
          label: 'Everything else',
          backgroundColor: hexWithAlpha(lineColor, 0.3),
          data: data.map((point, index) => Math.max(0, totals[index] - point[reason.key])),
        },
      ]
    : [{ ...bar, label: 'Time delayed', backgroundColor: lineColor, data: totals }];

  return (
    <ChartStack>
      <ChartDiv isMobile={isMobile}>
        <Bar
          id={`delayTotals-${linePath}`}
          role="img"
          aria-label={`Time delayed per ${period}`}
          height={isMobile ? 240 : 200}
          ref={ref}
          data={{ labels, datasets }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: 'index' },
            // @ts-expect-error The watermark plugin doesn't have typescript support
            watermark: watermarkLayout(isMobile),
            plugins: {
              legend: { display: false },
              tooltip: {
                filter: hideZeroUnlessAllZero,
                callbacks: {
                  title: (context) =>
                    agg === 'weekly' ? `Week of ${context[0]?.label ?? ''}` : context[0]?.label,
                  label: (item) =>
                    `${item.dataset.label}: ${getFormattedTimeString(item.parsed.y ?? 0, 'minutes')}`,
                  footer: (items) => {
                    if (!reason || !items.length) return '';
                    const total = totals[items[0].dataIndex];
                    return `Total: ${getFormattedTimeString(total, 'minutes')}`;
                  },
                },
              },
            },
            scales: {
              y: {
                stacked: true,
                min: 0,
                border: { display: false },
                grid: { color: chartTheme.grid },
                ticks: { color: chartTheme.tick },
                title: {
                  display: true,
                  text: 'Time delayed (minutes)',
                  color: chartTheme.tick,
                },
              },
              x: {
                stacked: true,
                type: 'time',
                min: startDate,
                max: endDate,
                offset: true,
                grid: { display: false },
                border: { color: chartTheme.axisBorder },
                time: {
                  unit: agg === 'weekly' ? 'month' : 'week',
                  tooltipFormat: 'MMM d, yyyy',
                  displayFormats: { month: 'MMM', week: 'MMM d' },
                },
                ticks: { color: chartTheme.tick },
                adapters: { date: { locale: enUS } },
              },
            },
          }}
          plugins={[ChartjsPluginWatermark]}
        />
      </ChartDiv>
      <div className="flex flex-row items-end justify-end gap-4">
        <SaveChartImageButton
          chartRef={ref}
          datasetName="delay-totals"
          includeBothStopsForLocation={false}
          startDate={startDate}
          endDate={endDate}
        />
        <DownloadButton
          data={data}
          datasetName="delay-totals"
          includeBothStopsForLocation={false}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
    </ChartStack>
  );
};
