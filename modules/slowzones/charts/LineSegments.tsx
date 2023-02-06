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
import React, { useMemo, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { COLORS } from '../../../common/constants/colors';
import type { SlowZoneResponse } from '../../../common/types/dataPoints';
import type { LineShort } from '../../../common/types/lines';
import { formatSlowZones, getRoutes } from '../../../common/utils/slowZoneUtils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, TimeScale);

export const LineSegments: React.FC<{ data: SlowZoneResponse[]; line: LineShort | undefined }> = ({
  data,
  line,
}) => {
  const ref = useRef();
  const formattedData = useMemo(
    () =>
      formatSlowZones(data.filter((d) => new Date(d.end) > new Date(2022, 5, 1))).filter(
        (sz) => sz.direction === 'southbound' && sz.color === line
      ),
    [data, line]
  );
  const routes = useMemo(() => getRoutes(formattedData, 'southbound'), [formattedData]);

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
            data: formattedData.map((sz) => {
              return { x: [sz.start, sz.end], id: sz.id, delay: sz.delay };
            }),
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
            min: new Date(2022, 5, 1).toISOString(),
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
                  new Date(data.x[0]).toDateString() + ' - ' + new Date(data.x[1]).toDateString()
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
