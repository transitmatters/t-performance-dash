import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import React from 'react';
import headwaysData from './data/headways.json';
import { drawTitle } from './Title';

ChartJS.register(
  CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const prettyDate = (dateString: string, with_dow: boolean) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: with_dow ? 'long' : undefined,
  };
  return new Date(`${dateString}T00:00:00`).toLocaleDateString(
    undefined, // user locale/language
    options
  );
};

const point_colors = (data, metric_field: string, benchmark_field: string) => {
  return data.map((point) => {
    const ratio = point[metric_field] / point[benchmark_field];
    if (point[benchmark_field] === null) {
      return '#1c1c1c'; //grey
    } else if (ratio <= 1.25) {
      return '#64b96a'; //green
    } else if (ratio <= 1.5) {
      return '#f5ed00'; //yellow
    } else if (ratio <= 2.0) {
      return '#c33149'; //red
    } else if (ratio > 2.0) {
      return '#bb5cc1'; //purple
    }

    return '#1c1c1c'; //whatever
  });
};

const departure_from_normal_string = (metric, benchmark) => {
  const ratio = metric / benchmark;
  if (!isFinite(ratio) || ratio <= 1.25) {
    return '';
  } else if (ratio <= 1.5) {
    return '>25% longer than normal';
  } else if (ratio <= 2.0) {
    return '>50% longer than normal';
  } else if (ratio > 2.0) {
    return '>100% longer than normal';
  }
};

export const SingleDayLineChart = () => {
  const labels = headwaysData.map((item) => item.current_dep_dt);
  return (
    <Line
      height={250}
      data={{
        labels,
        datasets: [
          {
            label: `Actual`,
            fill: false,
            pointBackgroundColor: point_colors(
              headwaysData,
              'headway_time_sec',
              'benchmark_headway_time_sec'
            ),
            pointHoverRadius: 3,
            pointHoverBackgroundColor: point_colors(
              headwaysData,
              'headway_time_sec',
              'benchmark_headway_time_sec'
            ),
            pointRadius: 3,
            pointHitRadius: 10,
            data: headwaysData.map((headway) => (headway.headway_time_sec / 60).toFixed(2)),
          },
          {
            label: `Benchmark MBTA`,
            data: headwaysData.map((headway) =>
              (headway.benchmark_headway_time_sec / 60).toFixed(2)
            ),
            pointRadius: 0,
            pointHoverRadius: 0,
            fill: true,
            backgroundColor: 'grey',
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 25,
          },
        },
        plugins: {
          tooltip: {
            mode: 'index',
            position: 'nearest',
            callbacks: {
              afterBody: (tooltipItems) => {
                return departure_from_normal_string(
                  tooltipItems[0].formattedValue,
                  tooltipItems[1]?.formattedValue
                );
              },
            },
          },
          legend: {
            display: false,
          },
          title: {
            // empty title to set font and leave room for drawTitle fn
            display: true,
            text: '',
          },
        },
        interaction: {
          mode: 'index',
          intersect: false,
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
              unit: 'hour',
              tooltipFormat: 'LTS', // locale time with seconds
            },
            adapters: {
              date: {
                locale: enUS,
              },
            },
            display: true,
            title: {
              display: true,
              text: prettyDate('2022-10-17', true),
            },
          },
        },
      }}
      plugins={[
        {
          id: 'customTitle',
          afterDraw: (chart) => {
            drawTitle(
              'Time between trains (Headways)',
              { to: 'Park Street', from: 'Porter', direction: 'southbound', line: 'Red' },
              true,
              chart
            );
          },
        },
      ]}
    />
  );
};
