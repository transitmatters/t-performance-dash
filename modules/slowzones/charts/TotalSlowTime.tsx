import React, { useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import { Line } from 'react-chartjs-2';
import dayjs from 'dayjs';
import { COLORS, LINE_COLORS } from '../../../common/constants/colors';
import type { DayDelayTotals } from '../../../common/types/dataPoints';
import { useDelimitatedRoute } from '../../../common/utils/router';

interface TotalSlowTimeProps {
  data?: DayDelayTotals[];
}
Chart.register(...registerables);

export const TotalSlowTime: React.FC<TotalSlowTimeProps> = ({ data }) => {
  const ref = useRef();
  const labels = data?.map((item) => item['date']);
  const {
    line,
    lineShort,
    query: { startDate, endDate },
  } = useDelimitatedRoute();

  if (!(lineShort && line)) {
    return null;
  }
  if (!endDate) {
    return <p>Select a date range to see total slow times.</p>;
  }

  return (
    <Line
      ref={ref}
      id={'total_slow_time'}
      data={{
        labels,
        datasets: [
          {
            label: `${lineShort} Line`,
            data: data?.map((d) => (d[lineShort] / 60).toFixed(2)),
            borderColor: LINE_COLORS[line],
            backgroundColor: LINE_COLORS[line],
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
            ticks: {
              color: COLORS.design.subtitleGrey,
            },
            title: {
              display: true,
              text: 'Minutes',
              color: COLORS.design.subtitleGrey,
            },
          },
          x: {
            type: 'time',

            min: dayjs(startDate).toISOString(),
            max: dayjs(endDate).toISOString(),
            ticks: {
              color: COLORS.design.subtitleGrey,
            },
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
