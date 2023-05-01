import React from 'react';
import Color from 'chartjs-color';
import { Chart as ChartJS, registerables } from 'chart.js';

import { Line } from 'react-chartjs-2';
import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import type { LineData, ServiceDay } from '../../../common/types/ridership';
import { getHourlyTickValues } from '../../../common/utils/ridership';
import { COLORS } from '../../../common/constants/colors';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';

const hourLabels = getHourlyTickValues(1);

interface TphChartProps {
  lineData: LineData | undefined;
  serviceDay: ServiceDay;
  highestTph: number;
  color: string;
}

ChartJS.register(...registerables, ChartjsPluginWatermark);

export const TphChart: React.FC<TphChartProps> = ({ color, lineData, serviceDay, highestTph }) => {
  const isMobile = !useBreakpoint('md');

  const currentColor = Color(color).alpha(0.4).rgbString();

  const baselineTph = lineData?.serviceRegimes?.baseline[serviceDay].tripsPerHour;
  const currentTph = lineData?.serviceRegimes?.current[serviceDay].tripsPerHour;

  const datasets = [
    {
      label: 'Pre-COVID trips per hour',
      data: baselineTph,
      stepped: true,
      borderColor: color,
      borderWidth: 2,
      backgroundColor: 'rgba(0,0,0,0)',
    },
    {
      label: 'Current trips per hour',
      data: currentTph,
      stepped: true,
      borderWidth: 2,
      borderColor: 'rgba(0,0,0,0)',
      backgroundColor: currentColor,
      fill: true,
    },
  ];

  return (
    <div className={'w-full'}>
      <Line
        height={200}
        data={{
          labels: hourLabels,
          datasets,
        }}
        redraw={true}
        options={{
          maintainAspectRatio: false,
          animation: { duration: 0 },
          // @ts-expect-error The watermark plugin doesn't have typescript support
          watermark: {
            image: new URL('/Logo_wordmark.png', window.location.origin).toString(),
            x: 10,
            y: 10,
            opacity: 0.2,
            width: isMobile ? 120 : 160,
            height: isMobile ? 11.25 : 15,
            alignToChartArea: true,
            alignX: 'right',
            alignY: 'top',
            position: 'back',
          },
          plugins: {
            legend: {
              position: 'top',
              align: 'end',
              labels: { boxWidth: 15 },
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: ({ datasetIndex, dataIndex }) => {
                  const { label, data } = datasets[datasetIndex];
                  return `${label}: ${data?.[dataIndex]} (each direction)`;
                },
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                maxTicksLimit: 12,
                color: COLORS.design.subtitleGrey,
              },
            },
            y: {
              grid: { display: false },
              suggestedMax: highestTph,
              ticks: {
                maxTicksLimit: 4,
                color: COLORS.design.subtitleGrey,
              },
            },
          },
          elements: {
            line: { tension: 0 },
            point: { radius: 0 },
          },
        }}
      />
    </div>
  );
};
