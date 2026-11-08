import { useRef } from 'react';
import { Bar } from '@chartjs-components';

import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { useChartTheme } from '../../../common/utils/chartTheme';
import { hexWithAlpha } from '../../../common/utils/general';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import { watermarkLayout } from '../../../common/constants/charts';
import { ChartStack } from '../../../common/components/charts/ChartStack';
import { SaveChartImageButton } from '../../../common/components/buttons/SaveChartImageButton';
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

  const pick = (index: number) => {
    const { key } = rows[index];
    onFocus?.(key === focus ? null : key);
  };

  return (
    <ChartStack className={fill ? 'h-full' : undefined}>
      <div
        className={fill ? 'relative min-h-0 w-full flex-1' : 'w-full'}
        style={fill ? undefined : { height: rows.length * ROW_HEIGHT + 16 }}
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
            // Room at the right for the value labels on the longest bar
            layout: { padding: { right: isMobile ? 88 : 110 } },
            onClick: (_event, elements) => {
              if (elements.length) pick(elements[0].index);
            },
            onHover: (_event, elements, chart) => {
              chart.canvas.style.cursor = onFocus && elements.length ? 'pointer' : 'default';
            },
            // @ts-expect-error The watermark plugin doesn't have typescript support
            watermark: watermarkLayout(isMobile),
            plugins: {
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
                offset: 4,
                clip: false,
                color: chartTheme.tick,
                font: { size: 12 },
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
          plugins={[ChartjsPluginWatermark]}
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
      {!fill && (
        <div className="flex flex-row items-end justify-end gap-4">
          <SaveChartImageButton
            chartRef={ref}
            datasetName="delay-causes"
            includeBothStopsForLocation={false}
            startDate={startDate}
            endDate={endDate}
          />
          <DelaysEmbedButton chart="causes" />
        </div>
      )}
    </ChartStack>
  );
};
