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
import type { LineDelays } from '../../../common/types/delays';
import { getFormattedTimeString } from '../../../common/utils/time';
import type { DelayReasonKey } from '../constants/reasons';
import { causeRows } from '../reasonSeries';

interface DelayCauseBarsProps {
  data: LineDelays[];
  startDate: string;
  endDate: string;
  focus: DelayReasonKey | null;
  onFocus: (key: DelayReasonKey | null) => void;
}

const ROW_HEIGHT = 36;

export const DelayCauseBars = ({
  data,
  startDate,
  endDate,
  focus,
  onFocus,
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
    `${getFormattedTimeString(rows[index].total, 'minutes')} · ${Math.round(rows[index].share * 100)}%`;

  const pick = (index: number) => {
    const { key } = rows[index];
    onFocus(key === focus ? null : key);
  };

  return (
    <ChartStack>
      <div className="w-full" style={{ height: rows.length * ROW_HEIGHT + 16 }}>
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
              chart.canvas.style.cursor = elements.length ? 'pointer' : 'default';
            },
            // @ts-expect-error The watermark plugin doesn't have typescript support
            watermark: watermarkLayout(isMobile),
            plugins: {
              legend: { display: false },
              tooltip: { enabled: false },
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
      <div className="flex flex-row items-end justify-end gap-4">
        <SaveChartImageButton
          chartRef={ref}
          datasetName="delay-causes"
          includeBothStopsForLocation={false}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
    </ChartStack>
  );
};
