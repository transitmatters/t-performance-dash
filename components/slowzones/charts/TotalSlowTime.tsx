import React, { useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import { Line } from 'react-chartjs-2';
import { LINE_COLORS } from '../../../utils/constants';

import { DayDelayTotals } from '../../../types/dataPoints';

interface TotalSlowTimeProps {
  line: string;
  data?: DayDelayTotals[];
}
Chart.register(...registerables);

export const TotalSlowTime = ({ data, line }: TotalSlowTimeProps) => {
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
            label: `${line} Line`,
            data: data?.map((d) => (d[line] / 60).toFixed(2)),
            borderColor: LINE_COLORS[line.toUpperCase()],
            backgroundColor: LINE_COLORS[line.toUpperCase()],
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
              displayFormats: {
                month: 'MMM',
              },
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
