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
import { YESTERDAY_UTC } from '../../../common/components/inputs/DateSelection/DateConstants';
import { COLORS } from '../../../common/constants/colors';
import type { LineSegmentData, SlowZoneResponse } from '../../../common/types/dataPoints';
import type { LineShort } from '../../../common/types/lines';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { formatSlowZones, getRoutes } from '../../../common/utils/slowZoneUtils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, TimeScale);

export const LineSegments: React.FC<{ data: SlowZoneResponse[]; line: LineShort | undefined }> = ({
  data,
  line,
}) => {
  const ref = useRef();
  const {
    query: { startDate, endDate },
  } = useDelimitatedRoute();
  const startDateUTC = dayjs.utc(startDate);
  const endDateUTC = dayjs.utc(endDate);
  const formattedData = useMemo(
    () =>
      formatSlowZones(
        data.filter((d) => {
          const szDate = dayjs.utc(d.end);
          return szDate.isAfter(dayjs(startDateUTC));
        })
      ).filter((sz) => sz.direction === 'southbound'),
    [data, startDateUTC]
  );
  const routes = useMemo(() => getRoutes(formattedData, 'southbound'), [formattedData]);

  const lineSegmentData: LineSegmentData[] = formattedData.map((sz) => {
    return {
      x: [dayjs.utc(sz.start).format('YYYY-MM-DD'), dayjs.utc(sz.end).format('YYYY-MM-DD')],
      id: sz.id,
      delay: sz.delay,
    };
  });

  if (!endDate) {
    return (
      <p>
        Select a date <b>range</b> to see slow zone segments
      </p>
    );
  }

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
              title: function (context) {
                return context[0].label;
              },
              label: function (context) {
                // @ts-expect-error data type is unknown
                return 'Delay: ' + context.raw.delay.toFixed(0) + ' s';
              },
              beforeBody: function (context) {
                const data = context[0].raw;
                return (
                  // @ts-expect-error data type is unknown
                  `${dayjs.utc(data.x[0]).format('MMM D, YYYY')} - ${
                    // @ts-expect-error data type is unknown
                    dayjs.utc(data.x[1]).isSame(YESTERDAY_UTC)
                      ? 'Ongoing'
                      : // @ts-expect-error data type is unknown
                        dayjs(data.x[1]).format('MMM D, YYYY')
                  }`
                );
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
