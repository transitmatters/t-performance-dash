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
import { ChartActions } from '../../../common/components/charts/ChartActions';
import { ChartDiv } from '../../../common/components/charts/ChartDiv';
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
import { hasShare, minShareMinutes, periodTotals, shareValues } from '../reasonSeries';
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
  // Too little delay to say anything about the mix, so the period is left blank.
  const showsShare = (index: number) => !isShare || hasShare(totals[index], floor);
  const minutesOf = (item: { datasetIndex: number; dataIndex: number }) =>
    series[item.datasetIndex].values[item.dataIndex];

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
              data: isShare ? shareValues(layer.values, totals, floor) : layer.values,
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
                itemSort: (a, b) => minutesOf(b) - minutesOf(a),
                // A period left blank still lists the causes it had, by minutes.
                filter: (item, index, items) =>
                  showsShare(item.dataIndex)
                    ? hideZeroUnlessAllZero(item, index, items)
                    : minutesOf(item) > 0 || totals[item.dataIndex] === 0,
                callbacks: {
                  title: (context) => delayPeriodTitle(agg, context[0]?.label ?? ''),
                  label: (tooltipItem) => {
                    const { y } = tooltipItem.parsed;
                    const time = formatDelay(minutesOf(tooltipItem));
                    return showsShare(tooltipItem.dataIndex) && isShare
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
      <ChartActions
        datasetName="delays-by-reason"
        chartRef={ref}
        csv={data}
        startDate={startDate}
        endDate={endDate}
        embed={<DelaysEmbedButton chart="breakdown" />}
      />
    </ChartStack>
  );
};
