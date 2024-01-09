/* eslint-disable import/no-unused-modules */
import React, { useMemo } from 'react';
import { Bar as BarChart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import Color from 'color';

import { useBreakpoint } from '../../../hooks/useBreakpoint';
import type { ByHourDataset, DisplayStyle, ValueAxis as ValueAxis } from './types';
import { resolveStyle } from './styles';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Props {
  style?: Partial<DisplayStyle>;
  data: ByHourDataset[];
  valueAxis: ValueAxis;
}

const allTimeLabels = ['AM', 'PM']
  .map((label) => Array.from({ length: 12 }, (_, i) => `${i === 0 ? 12 : i} ${label}`))
  .flat();

const rotate = <T extends string | number>(arr: T[]): T[] => [...arr.slice(1), arr[0]];

const stripZeroHoursAndRotateMidnightToEnd = (
  datasets: ByHourDataset[]
): { data: ByHourDataset[]; timeLabels: string[] } => {
  let stripIndex = 0;
  const rotatedDatasets = datasets.map((dataset) => ({ ...dataset, data: rotate(dataset.data) }));
  for (let i = 0; i < rotatedDatasets[0].data.length; i++) {
    if (rotatedDatasets.every((dataset) => dataset.data[i] === 0)) {
      stripIndex++;
    } else {
      break;
    }
  }
  const timeLabels = rotate(allTimeLabels).slice(stripIndex);
  const strippedDatasets = rotatedDatasets.map((dataset) => {
    return {
      ...dataset,
      data: dataset.data.slice(stripIndex),
    };
  });
  return { data: strippedDatasets, timeLabels };
};

export const ByHourHistogram: React.FC<Props> = (props) => {
  const { data: dataWithZeros, valueAxis, style: baseStyle = null } = props;
  const { data, timeLabels } = useMemo(
    () => stripZeroHoursAndRotateMidnightToEnd(dataWithZeros),
    [dataWithZeros]
  );
  const isMobile = !useBreakpoint('md');

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
      plugins: {
        legend: {
          display: true,
          position: 'bottom' as const,
        },
        tooltip: {
          mode: 'index' as const,
          callbacks: {
            label: (context) => {
              const { datasetIndex, dataIndex } = context;
              const dataset = data[datasetIndex];
              const value = dataset.data[dataIndex];
              const { label } = dataset;
              return `${label}: ${value} ${valueAxis.tooltipItemLabel ?? ''}`.trim();
            },
          },
        },
      },
    };
  }, [valueAxis.title, valueAxis.tooltipItemLabel, data]);

  return <BarChart data={chartData} options={chartOptions} height={isMobile ? 50 : 70} />;
};
