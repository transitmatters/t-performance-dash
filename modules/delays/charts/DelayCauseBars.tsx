import { useRef } from 'react';
import { Chart } from '@chartjs-utils';
import { Bar } from '@chartjs-components';

import { useDelimitatedRoute } from '../../../common/utils/router';
import { useChartTheme } from '../../../common/utils/chartTheme';
import { hexWithAlpha } from '../../../common/utils/general';
import { watermarkSize } from '../../../common/constants/charts';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import { ChartStack } from '../../../common/components/charts/ChartStack';
import { ChartActions } from '../../../common/components/charts/ChartActions';
import { DelaysEmbedButton } from '../DelaysEmbedButton';
import { formatDelay } from '../format';
import type { DelayReasonKey } from '../constants/reasons';
import type { DelayRow } from '../reasonSeries';
import { causeRows } from '../reasonSeries';

interface DelayCauseBarsProps {
  data: DelayRow[];
  startDate: string;
  endDate: string;
  focus: DelayReasonKey | null;
  /** Clicking a cause highlights it in the total chart. An embed has no total chart, so leaves it out. */
  onFocus?: (key: DelayReasonKey | null) => void;
  /** Fill the parent's height and leave out the buttons, as an embed does. */
  fill?: boolean;
}

const ROW_HEIGHT = 36;
const LABEL_FONT_SIZE = 12;
const LABEL_OFFSET = 6;

let measureContext: CanvasRenderingContext2D | null = null;
const labelWidth = (text: string) => {
  measureContext ??= document.createElement('canvas').getContext('2d');
  if (!measureContext) return text.length * LABEL_FONT_SIZE * 0.6;
  measureContext.font = `${LABEL_FONT_SIZE}px ${Chart.defaults.font.family}`;
  return measureContext.measureText(text).width;
};

export const DelayCauseBars = ({
  data,
  startDate,
  endDate,
  focus,
  onFocus,
  fill = false,
}: DelayCauseBarsProps) => {
  const { line, linePath } = useDelimitatedRoute();
  const ref = useRef(null);
  const chartTheme = useChartTheme();
  const isMobile = !useBreakpoint('md');
  const rows = causeRows(data, line);

  if (!rows.length) {
    return (
      <p className="text-sm text-stone-600 dark:text-stone-400">
        No delay alerts in this date range.
      </p>
    );
  }

  const valueLabel = (index: number) =>
    `${formatDelay(rows[index].total)} · ${Math.round(rows[index].share * 100)}%`;

  // Commuter Rail rows only have the announced delay, so there's nothing to compare
  const isActual = data.some((point) => point.delay_alert_minutes != null);

  const hoverCard = (index: number) => {
    const { key, label, color, total, share } = rows[index];
    const announced = data.reduce((sum, point) => sum + point.stated_by_cause[key], 0);
    return {
      title: label,
      hero: {
        value: formatDelay(total),
        caption: isActual ? 'Alerts were up' : 'Time delayed',
        color,
      },
      rows: [
        ...(isActual ? [{ label: "MBTA's estimate", value: formatDelay(announced) }] : []),
        { label: 'Share of all delay time', value: `${Math.round(share * 100)}%` },
      ],
      notes: onFocus
        ? [
            key === focus
              ? 'Click to clear the highlight'
              : 'Click to highlight it in the chart above',
          ]
        : [],
    };
  };

  // Only labels on the longest bars reach the right edge. Near-ties count too, since a slightly
  // shorter bar can have a wider label ("120h 35m" vs "291h"). Rows are sorted longest first.
  const nearLongest = rows.filter((row) => row.total >= rows[0].total * 0.8);
  const widestLabel = Math.max(...nearLongest.map((_, index) => labelWidth(valueLabel(index))));
  const labelRoom = Math.ceil(widestLabel) + LABEL_OFFSET + 2;
  // The watermark sits in a strip under the bars, clear of every value label
  const watermarkRoom = Math.ceil(watermarkSize(isMobile).height) + 6;

  const pick = (index: number) => {
    const { key } = rows[index];
    onFocus?.(key === focus ? null : key);
  };

  return (
    <ChartStack className={fill ? 'h-full' : undefined}>
      <div
        className={fill ? 'relative min-h-0 w-full flex-1' : 'w-full'}
        style={fill ? undefined : { height: rows.length * ROW_HEIGHT + 16 + watermarkRoom }}
      >
        <Bar
          id={`delayCauses-${linePath}`}
          role="img"
          aria-label={rows.map((row, index) => `${row.label}: ${valueLabel(index)}`).join('. ')}
          ref={ref}
          data={{
            labels: rows.map((row) => row.label),
            datasets: [
              {
                label: 'Time delayed',
                data: rows.map((row) => row.total),
                backgroundColor: rows.map((row) =>
                  focus && row.key !== focus ? hexWithAlpha(row.color, 0.3) : row.color
                ),
                borderRadius: 2,
                barPercentage: 0.75,
                categoryPercentage: 1,
              },
            ],
          }}
          options={{
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: { right: labelRoom, bottom: watermarkRoom } },
            onClick: (_event, elements) => {
              if (elements.length) pick(elements[0].index);
            },
            onHover: (_event, elements, chart) => {
              chart.canvas.style.cursor = onFocus && elements.length ? 'pointer' : 'default';
            },
            plugins: {
              watermark: { placement: 'below' },
              legend: { display: false },
              tooltip: {
                callbacks: {
                  hoverCard: (items) => (items.length ? hoverCard(items[0].dataIndex) : null),
                },
              },
              datalabels: {
                display: true,
                anchor: 'end',
                align: 'end',
                offset: LABEL_OFFSET,
                padding: 0,
                clip: false,
                color: chartTheme.tick,
                font: { size: LABEL_FONT_SIZE },
                formatter: (_value, context) => valueLabel(context.dataIndex),
              },
            },
            scales: {
              x: { display: false, min: 0 },
              y: {
                grid: { display: false },
                border: { display: false },
                ticks: { color: chartTheme.tick, font: { size: 13 } },
              },
            },
          }}
        />
      </div>
      {onFocus && (
        <ul className="sr-only flex flex-wrap gap-2 text-sm focus-within:not-sr-only">
          {rows.map((row) => (
            <li key={row.key}>
              <button
                type="button"
                aria-pressed={focus === row.key}
                onClick={() => onFocus(focus === row.key ? null : row.key)}
              >
                Highlight {row.label} in the chart above
              </button>
            </li>
          ))}
        </ul>
      )}
      <ChartActions
        datasetName="delay-causes"
        chartRef={ref}
        startDate={startDate}
        endDate={endDate}
        chartSubtitle="Total for these dates"
        embed={<DelaysEmbedButton chart="causes" />}
      />
    </ChartStack>
  );
};
