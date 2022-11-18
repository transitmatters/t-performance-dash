import React, { useRef } from 'react';
import { Chart as ChartJS, LineElement, PointElement } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import { Line } from 'react-chartjs-2';
import { LINE_COLORS } from '../../../utils/constants';

import { DayDelayTotals } from '../../../types/dataPoints';

ChartJS.register(PointElement, LineElement);
export const TotalSlowTime = ({ data }: { data?: DayDelayTotals[] }) => {
  const ref = useRef();
  const labels = data?.map((item) => item['date']);
  return (
    <Line
      ref={ref}
      id={'total_slow_time'}
      height={800}
      data={{
        labels,
        datasets: [
          {
            label: 'Blue Line',
            data: data?.map((d) => (d.Blue / 60).toFixed(2)),
            borderColor: LINE_COLORS.BLUE,
            backgroundColor: LINE_COLORS.BLUE,
            pointRadius: 0,
            tension: 0.1,
          },
          {
            label: 'Red Line',
            data: data?.map((d) => (d.Red / 60).toFixed(2)),
            borderColor: LINE_COLORS.RED,
            backgroundColor: LINE_COLORS.RED,
            pointRadius: 0,
            tension: 0.1,
          },
          {
            label: 'Orange Line',
            data: data?.map((d) => (d.Orange / 60).toFixed(2)),
            borderColor: LINE_COLORS.ORANGE,
            backgroundColor: LINE_COLORS.ORANGE,
            pointRadius: 0,
            tension: 0.1,
          },
        ],
      }}
      options={{
        maintainAspectRatio: false,
        elements: {
          point: {
            radius: 6,
            hitRadius: 6,
            hoverRadius: 6,
          },
        },
        responsive: true,
        layout: {
          padding: {
            top: 25,
          },
        },
        scales: {
          y: {
            display: true,
            title: {
              display: true,
              text: 'Minutes',
            },
          },
          x: {
            type: 'time',
            time: {
              unit: 'month',
            },

            adapters: {
              date: {
                locale: enUS,
              },
            },
            display: true,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      }}
    />
  );
};
