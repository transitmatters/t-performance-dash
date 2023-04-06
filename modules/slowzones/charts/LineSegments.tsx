import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { enUS } from 'date-fns/locale';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import React, { useMemo, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { YESTERDAY_MIDNIGHT } from '../../../common/constants/dates';
import { COLORS } from '../../../common/constants/colors';
import type { LineSegmentData, SlowZone } from '../../../common/types/dataPoints';
import type { LineShort } from '../../../common/types/lines';
import { getRoutes } from '../../../common/utils/slowZoneUtils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, TimeScale);

interface LineSegmentsProps {
  data: SlowZone[];
  line: LineShort;
  startDateUTC: dayjs.Dayjs;
  endDateUTC: dayjs.Dayjs;
}

export const LineSegments: React.FC<LineSegmentsProps> = ({
  data,
  line,
  startDateUTC,
  endDateUTC,
}) => {
  const ref = useRef();
  const routes = useMemo(() => getRoutes('southbound', data), [data]);

  const lineSegmentData: LineSegmentData[] | undefined = data.map((sz) => {
    return {
      x: [dayjs.utc(sz.start).format('YYYY-MM-DD'), dayjs.utc(sz.end).format('YYYY-MM-DD')],
      id: sz.id,
      delay: sz.delay,
    };
  });

  return (
    <Bar
      height={550}
      ref={ref}
      id={'timeline-slow-zones'}
      data={{
        labels: routes,
        datasets: [
          {
            label: line,
            minBarLength: 28,
            backgroundColor: line && COLORS.mbta[line.toLowerCase()],
            borderSkipped: true,
            data: lineSegmentData,
          },
        ],
      }}
      plugins={[ChartDataLabels]}
      options={{
        maintainAspectRatio: false,
        responsive: true,

        layout: {
          padding: {},
        },

        parsing: {
          yAxisKey: 'id',
        },
        indexAxis: 'y',
        scales: {
          x: {
            min: startDateUTC.toISOString(),
            max: endDateUTC.toISOString(),
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
          y: {
            stacked: true,
            beginAtZero: true,
            ticks: {
              autoSkip: false,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              title: (context) => {
                return context[0].label;
              },
              label: (context) => {
                return 'Delay: ' + data[context.datasetIndex].delay.toFixed(0) + ' sec';
              },
              beforeBody: (context) => {
                const start = context[0].parsed._custom?.barStart;
                const end = context[0].parsed._custom?.barEnd;
                if (!(start && end)) return 'Unknown dates';
                const startUTC = dayjs.utc(start);
                const endUTC = dayjs.utc(end);
                return `${startUTC.format('MMM D, YYYY')} - ${
                  dayjs.utc(endUTC).isSame(YESTERDAY_MIDNIGHT)
                    ? 'Ongoing'
                    : dayjs(endUTC).format('MMM D, YYYY')
                }`;
              },
            },
          },
          datalabels: {
            anchor: 'center',
            clamp: true,
            clip: false,
            formatter: function (context) {
              return context.delay.toFixed(0) + ' s';
            },
            labels: {
              value: {
                color: 'white',
              },
            },
            display: function (ctx) {
              const scale = ctx.chart.scales.y; // 'y' is your scale id
              const range = Math.max(scale.max - scale.min, 1);
              return (ctx.chart.height / range) * 3 > 16;
            },
          },
        },
      }}
    />
  );
};
