import { useMemo, useRef, useCallback } from 'react';
import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import Color from 'color';

import type { TooltipItem } from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from '@chartjs-utils';
import { Bar as BarChart } from '@chartjs-components';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { watermarkLayout } from '../../../constants/charts';
import { getFormattedTimeString } from '../../../utils/time';
import { SERVICE_DAY_START_HOUR } from '../../../constants/time';
import type { HoverCardContent } from '../hoverCard/types';
import type { ByHourDataset, DisplayStyle, ValueAxis as ValueAxis } from './types';
import { resolveStyle } from './styles';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Props {
  style?: Partial<DisplayStyle>;
  data: ByHourDataset[];
  valueAxis: ValueAxis;
  /** Whether the dataset is roundtrips, and we want to additionally convert and show the values as headways */
  datasetRoundTrips?: boolean;
  /** The datasets are the same service on two dates, so hovering shows the change between them */
  compareDatasets?: boolean;
}

const allTimeLabels = ['AM', 'PM']
  .map((label) => Array.from({ length: 12 }, (_, i) => `${i === 0 ? 12 : i} ${label}`))
  .flat();

// Order hours by service day, so the trips after midnight come last
const toServiceDay = <T,>(hours: T[]): T[] => [
  ...hours.slice(SERVICE_DAY_START_HOUR),
  ...hours.slice(0, SERVICE_DAY_START_HOUR),
];

const toServiceDayWithoutEmptyHours = (
  datasets: ByHourDataset[]
): { data: ByHourDataset[]; timeLabels: string[] } => {
  const ordered = datasets.map((dataset) => ({ ...dataset, data: toServiceDay(dataset.data) }));
  const hasService = (hour: number) => ordered.some((dataset) => dataset.data[hour] !== 0);
  const hours = ordered[0].data.map((_, hour) => hour);
  const first = hours.findIndex(hasService);
  const last = hours.findLastIndex(hasService);
  if (first === -1) return { data: ordered, timeLabels: toServiceDay(allTimeLabels) };
  return {
    data: ordered.map((dataset) => ({ ...dataset, data: dataset.data.slice(first, last + 1) })),
    timeLabels: toServiceDay(allTimeLabels).slice(first, last + 1),
  };
};

export const ByHourHistogram = (props: Props) => {
  const {
    data: dataWithZeros,
    valueAxis,
    style: baseStyle = null,
    datasetRoundTrips = false,
    compareDatasets = false,
  } = props;
  const { data, timeLabels } = useMemo(
    () => toServiceDayWithoutEmptyHours(dataWithZeros),
    [dataWithZeros]
  );
  const ref = useRef(null);
  const isMobile = !useBreakpoint('md');

  const hoverCard = useCallback(
    (items: TooltipItem<'bar'>[]): HoverCardContent => {
      const unit = valueAxis.tooltipItemLabel;
      const format = (value: number) => {
        const rounded = Number(value.toFixed(1));
        if (!unit) return `${rounded}`;
        return `${rounded} ${rounded === 1 ? unit.replace(/s$/, '') : unit}`;
      };
      const rows = items.map((item) => {
        const value = item.parsed.y ?? 0;
        return {
          label: item.dataset.label ?? '',
          value: format(value),
          detail:
            datasetRoundTrips && value > 0
              ? `every ${getFormattedTimeString(3600 / value)}`
              : undefined,
          color: String(item.dataset.backgroundColor),
          borderColor: String(item.dataset.borderColor),
        };
      });
      const [before, after] = items.map((item) => item.parsed.y ?? 0);
      if (!compareDatasets || items.length !== 2 || !before) return { rows };
      const change = after - before;
      const sign = change < 0 ? '−' : '+';
      return {
        rows,
        badge: {
          tone: 'neutral',
          text:
            change === 0
              ? 'No change'
              : `${sign}${format(Math.abs(change))} (${sign}${Math.round(Math.abs((100 * change) / before))}%)`,
        },
      };
    },
    [datasetRoundTrips, compareDatasets, valueAxis.tooltipItemLabel]
  );

  const chartData = useMemo(() => {
    return {
      labels: timeLabels,
      datasets: data.map((dataset) => {
        const style = resolveStyle([baseStyle, dataset.style ?? null]);
        return {
          tooltip: {},
          label: dataset.label,
          data: dataset.data,
          borderColor: style.color,
          borderWidth: style.borderWidth,
          backgroundColor: Color(style.color)
            .alpha(style.opacity ?? 0)
            .toString(),
        };
      }),
    };
  }, [data, baseStyle, timeLabels]);

  const chartOptions = useMemo(() => {
    return {
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          title: {
            display: true,
            text: valueAxis.title,
          },
          beginAtZero: true,
          grid: {
            display: false,
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      watermark: watermarkLayout(isMobile),
      plugins: {
        legend: {
          display: true,
          position: 'bottom' as const,
        },
        tooltip: {
          mode: 'index' as const,
          callbacks: { hoverCard },
        },
      },
    };
  }, [valueAxis.title, isMobile, hoverCard]);

  return (
    <BarChart
      redraw
      ref={ref}
      data={chartData}
      options={chartOptions}
      height={isMobile ? 200 : 75}
      plugins={[ChartjsPluginWatermark]}
    />
  );
};
