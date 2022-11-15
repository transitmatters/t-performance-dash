import React, { useRef } from 'react';
import { Chart as ChartJS, LineElement, PointElement } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import { Line } from 'react-chartjs-2';
import { colorsForLine } from '../../../utils/constants';

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
            borderColor: colorsForLine['Blue'],
            backgroundColor: colorsForLine['Blue'],
            pointRadius: 0,
            tension: 0.1,
          },
          {
            label: 'Red Line',
            data: data?.map((d) => (d.Red / 60).toFixed(2)),
            borderColor: colorsForLine['Red'],
            backgroundColor: colorsForLine['Red'],
            pointRadius: 0,
            tension: 0.1,
          },
          {
            label: 'Orange Line',
            data: data?.map((d) => (d.Orange / 60).toFixed(2)),
            borderColor: colorsForLine['Orange'],
            backgroundColor: colorsForLine['Orange'],
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
