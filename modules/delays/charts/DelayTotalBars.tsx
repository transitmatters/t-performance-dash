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
import type { DelayRow } from '../reasonSeries';
import {
  type DelayAgg,
  AGG_PERIOD,
  barAxisBounds,
  delayAxisTicks,
  delayPeriodTitle,
  delayTimeAxis,
  formatDelay,
} from '../format';
import type { DelayReasonKey } from '../constants/reasons';
import { REASON_BY_KEY, reasonLabel } from '../constants/reasons';
import { hideZeroUnlessAllZero } from '../../../common/components/charts/hoverCard/external';
import { DelaysEmbedButton } from '../DelaysEmbedButton';

interface DelayTotalBarsProps {
  data: DelayRow[];
  startDate: string;
  endDate: string;
  agg: DelayAgg;
  focus: DelayReasonKey | null;
  /** Fill the parent's height and leave out the buttons, as an embed does. */
  fill?: boolean;
}

export const DelayTotalBars = ({
  data,
  startDate,
  endDate,
  agg,
  focus,
  fill = false,
}: DelayTotalBarsProps) => {
  const { line, linePath } = useDelimitatedRoute();
  const ref = useRef(null);
  const chartTheme = useChartTheme();
  const isMobile = !useBreakpoint('md');
  const lineColor = LINE_COLORS[line ?? 'default'];
  const period = AGG_PERIOD[agg];
  const timeAxis = delayTimeAxis(agg);

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
    <ChartStack className={fill ? 'h-full' : undefined}>
      <ChartDiv isMobile={isMobile} fill={fill}>
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
              // The page names a highlighted cause in the cause list; an embed needs the legend.
              legend: {
                display: fill && Boolean(reason),
                position: 'bottom',
                onClick: () => undefined,
                labels: { boxWidth: 12, color: chartTheme.tick },
              },
              tooltip: {
                filter: hideZeroUnlessAllZero,
                callbacks: {
                  title: (context) => delayPeriodTitle(agg, context[0]?.label ?? ''),
                  hoverCard: (items) => {
                    const point = data[items[0]?.dataIndex];
                    if (!point) return null;
                    const total = point.total_delay_time;
                    // Commuter Rail rows have only the announced delay, so there's nothing to compare
                    const isActual = point.delay_alert_minutes != null;
                    const rows: {
                      label: string;
                      value: string;
                      detail?: string;
                      color?: string;
                    }[] = [];
                    if (reason) {
                      const minutes = point[reason.key];
                      rows.push({
                        label: reasonLabel(reason, line),
                        value: formatDelay(minutes),
                        detail: total
                          ? `${Math.round((minutes / total) * 100)}% of the ${period}`
                          : undefined,
                        color: reason.color,
                      });
                    }
                    if (isActual) {
                      rows.push({
                        label: "MBTA's estimate",
                        value: formatDelay(point.stated_delay_time),
                      });
                    }
                    return {
                      hero: {
                        value: formatDelay(total),
                        caption: isActual ? 'Alerts were up' : 'Time delayed',
                        color: lineColor,
                      },
                      rows,
                    };
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
                ticks: { color: chartTheme.tick, ...delayAxisTicks(Math.max(0, ...totals)) },
                title: {
                  display: true,
                  text: 'Time delayed',
                  color: chartTheme.tick,
                },
              },
              x: {
                stacked: true,
                type: 'time',
                ...barAxisBounds(data, startDate, endDate, agg),
                offset: false,
                grid: { display: false },
                border: { color: chartTheme.axisBorder },
                time: timeAxis.time,
                ticks: { ...timeAxis.ticks, color: chartTheme.tick },
                adapters: { date: { locale: enUS } },
              },
            },
          }}
          plugins={[ChartjsPluginWatermark]}
        />
      </ChartDiv>
      {!fill && (
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
          <DelaysEmbedButton chart="total" />
        </div>
      )}
    </ChartStack>
  );
};
