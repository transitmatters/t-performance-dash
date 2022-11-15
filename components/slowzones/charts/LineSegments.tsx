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
import { SlowZoneResponse } from '../../../types/dataPoints';
import { colorsForLine } from '../../../utils/constants';
import { formatSlowZones, getRoutes, groupByLine } from '../../../utils/slowZoneUtils';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, TimeScale);

export const LineSegments = ({ data }: { data: SlowZoneResponse[] }) => {
  const ref = useRef();
  const formattedData = useMemo(
    () =>
      formatSlowZones(data.filter((d) => new Date(d.end) > new Date(2022, 5, 1))).filter(
        (sz) => sz.direction === 'southbound'
      ),
    [data]
  );
  const routes = useMemo(() => getRoutes(formattedData, 'southbound'), [formattedData]);
  const groupedByLine = useMemo(() => groupByLine(formattedData), [formattedData]);

  return (
    <div>
      <Bar
        ref={ref}
        height={'800'}
        id={'timeline-slow-zones'}
        data={{
          labels: routes,
          datasets: Object.entries(groupedByLine).map((line) => {
            const [name, szForLine] = line;
            return {
              label: name,
              backgroundColor: colorsForLine[name],
              borderSkipped: true,
              data: szForLine.map((sz) => {
                return { x: [sz.start, sz.end], id: sz.id, delay: sz.delay };
              }),
            };
          }),
        }}
        plugins={[ChartDataLabels]}
        options={{
          maintainAspectRatio: false,
          elements: {
            bar: {
              borderWidth: 2,
            },
          },
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
              anchor: 'end',
              align: 'start',
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
                const value = ctx.dataset.data[ctx.dataIndex];
                const range = Math.max(scale.max - scale.min, 1);
                return (ctx.chart.height / range) * 3 > 16;
              },
            },
          },
        }}
      />
    </div>
  );
};
