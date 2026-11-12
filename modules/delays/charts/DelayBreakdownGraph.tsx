import { useRef } from 'react';
import { Line } from '@chartjs-components';
import { round } from '@lodash-utils';

import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import dayjs from 'dayjs';

import { useDelimitatedRoute } from '../../../common/utils/router';
import { drawSimpleTitle } from '../../../common/components/charts/Title';
import { useChartTheme } from '../../../common/utils/chartTheme';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import { ChartStack } from '../../../common/components/charts/ChartStack';
import { ChartDiv } from '../../../common/components/charts/ChartDiv';
import { DownloadButton } from '../../../common/components/buttons/DownloadButton';
import { SaveChartImageButton } from '../../../common/components/buttons/SaveChartImageButton';
import { DelaysEmbedButton } from '../DelaysEmbedButton';
import type { LineDelays } from '../../../common/types/delays';
import {
  type DelayAgg,
  axisStart,
  delayAxisTicks,
  delayPeriodTitle,
  delayTimeAxis,
  formatDelay,
} from '../format';
import { getRemainingBlockAnnotation } from '../../service/utils/graphUtils';
import { DATE_FORMAT, TODAY } from '../../../common/constants/dates';
import type { ReasonSeries } from '../reasonSeries';
import { minShareMinutes, periodTotals } from '../reasonSeries';
import { hideZeroUnlessAllZero } from '../../../common/components/charts/hoverCard/external';

interface DelayBreakdownGraphProps {
  data: LineDelays[];
  series: ReasonSeries[];
  /** Minutes stacks absolute delay time; share normalises each period to 100% of all delay. */
  mode: 'minutes' | 'share';
  startDate: string;
  endDate: string;
  /** Text alternative for the canvas. */
  summary?: string;
  showTitle?: boolean;
  agg?: DelayAgg;
  /** Fill the parent's height and leave out the buttons, as an embed does. */
  fill?: boolean;
}

export const DelayBreakdownGraph = ({
  data,
  series,
  mode,
  startDate,
  endDate,
  summary,
  showTitle = false,
  agg = 'weekly',
  fill = false,
}: DelayBreakdownGraphProps) => {
  const { linePath } = useDelimitatedRoute();
  const ref = useRef(null);
  const chartTheme = useChartTheme();
  const isMobile = !useBreakpoint('md');
  const labels = data.map((point) => point.date);
  const isShare = mode === 'share';
  // An embed has no cause list beside it to read the colors from, so it always takes the legend.
  const showLegend = isMobile || fill;
  const timeAxis = delayTimeAxis(agg);

  // ISO date strings sort chronologically
  const sortedDates = [...labels].sort();
  const remainingBlocks = getRemainingBlockAnnotation(
    sortedDates.length
      ? dayjs(sortedDates[sortedDates.length - 1]).format(DATE_FORMAT)
      : TODAY.format(DATE_FORMAT)
  );
  const earlierBlocks = getRemainingBlockAnnotation(
    undefined,
    sortedDates.length ? dayjs(sortedDates[0]).format(DATE_FORMAT) : undefined
  );

  const totals = periodTotals(data);
  const floor = minShareMinutes(totals);
  const toPoint = (value: number, index: number) => {
    if (!isShare) return value;
    // Too little delay to say anything about the mix: leave a gap rather than a full-height band.
    return totals[index] > 0 && totals[index] >= floor ? (value / totals[index]) * 100 : null;
  };

  return (
    <ChartStack className={fill ? 'h-full' : undefined}>
      <ChartDiv isMobile={isMobile} fill={fill}>
        <Line
          id={`breakdownDelay-${mode}-${linePath}`}
          role="img"
          aria-label={summary}
          height={isMobile ? 240 : 200}
          ref={ref}
          data={{
            labels,
            datasets: series.map((layer, index) => ({
              label: layer.label,
              borderColor: 'rgba(255,255,255,0.55)',
              borderWidth: 0.75,
              backgroundColor: layer.color,
              pointRadius: 0,
              pointHoverRadius: 6,
              pointBorderWidth: 0,
              pointHoverBackgroundColor: layer.color,
              stepped: true,
              // Fill to the layer below; filling to zero lets the top layer cover the rest
              fill: index === 0 ? 'origin' : '-1',
              data: layer.values.map(toPoint),
            })),
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            layout: {
              padding: {
                top: showTitle ? 25 : 0,
              },
            },
            interaction: {
              intersect: false,
            },
            plugins: {
              tooltip: {
                mode: 'index',
                position: 'nearest',
                // Biggest contributor first, and no rows for reasons that were silent that period.
                itemSort: (a, b) => (b.parsed.y ?? 0) - (a.parsed.y ?? 0),
                filter: hideZeroUnlessAllZero,
                callbacks: {
                  title: (context) => delayPeriodTitle(agg, context[0]?.label ?? ''),
                  label: (tooltipItem) => {
                    const { y } = tooltipItem.parsed;
                    const minutes = series[tooltipItem.datasetIndex].values[tooltipItem.dataIndex];
                    const time = formatDelay(minutes);
                    return isShare
                      ? `${tooltipItem.dataset.label}: ${round(y ?? 0, 1)}% (${time})`
                      : `${tooltipItem.dataset.label}: ${time}`;
                  },
                },
              },
              // The cause list is the color key on wider screens; on a phone and in an embed a legend
              // stands in. It never filters: the cause list is the only filter.
              legend: {
                display: showLegend,
                position: 'bottom',
                onClick: () => undefined,
                labels: {
                  boxWidth: 12,
                  color: chartTheme.tick,
                },
              },
              title: {
                // empty title to set font and leave room for drawTitle fn
                display: showTitle,
                text: '',
              },
              annotation: {
                annotations: [...earlierBlocks, ...remainingBlocks],
              },
            },
            scales: {
              y: {
                stacked: true,
                min: 0,
                // Chart.js treats undefined as unset, falling back to its defaults
                max: isShare ? 100 : undefined,
                display: true,
                border: { display: false },
                grid: { color: chartTheme.grid },
                ticks: {
                  color: chartTheme.tick,
                  ...(isShare
                    ? { callback: (value: string | number) => `${value}%` }
                    : delayAxisTicks(Math.max(0, ...totals))),
                },
                title: {
                  display: true,
                  text: isShare ? 'Share of all delay time' : 'Time delayed',
                  color: chartTheme.tick,
                },
              },
              x: {
                min: axisStart(data, startDate),
                max: endDate,
                type: 'time',
                // Vertical rules add noise without helping readers compare values.
                grid: { display: false },
                border: { color: chartTheme.axisBorder },
                time: timeAxis.time,
                ticks: { ...timeAxis.ticks, color: chartTheme.tick },
                adapters: {
                  date: {
                    locale: enUS,
                  },
                },
                display: true,
                title: {
                  display: false,
                  text: ``,
                },
              },
            },
          }}
          plugins={[
            {
              id: 'customTitle',
              afterDraw: (chart) => {
                if (showTitle) drawSimpleTitle(`Delays`, chart);
              },
            },
          ]}
        />
      </ChartDiv>
      {!fill && (
        <div className="flex flex-row items-end justify-end gap-4">
          {startDate && (
            <>
              <SaveChartImageButton
                chartRef={ref}
                datasetName="delays-by-reason"
                includeBothStopsForLocation={false}
                startDate={startDate}
                endDate={endDate}
              />
              <DownloadButton
                data={data}
                datasetName="delays-by-reason"
                includeBothStopsForLocation={false}
                startDate={startDate}
                endDate={endDate}
              />
            </>
          )}
          <DelaysEmbedButton chart="breakdown" />
        </div>
      )}
    </ChartStack>
  );
};
