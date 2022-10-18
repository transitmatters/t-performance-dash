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
import { drawTitle } from './Title';
import { DataPoints } from './types/dataPoints';
import { colors } from './constants';

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

const point_colors = (data: DataPoints, metric_field: string, benchmark_field?: string) => {
  return data.map((point) => {
    if (benchmark_field) {
      const ratio = point[metric_field] / point[benchmark_field];
      if (point[benchmark_field] === null) {
        return colors.grey; //grey
      } else if (ratio <= 1.25) {
        return colors.green; //green
      } else if (ratio <= 1.5) {
        return colors.yellow; //yellow
      } else if (ratio <= 2.0) {
        return colors.red; //red
      } else if (ratio > 2.0) {
        return colors.purple; //purple
      }
    }

    return colors.grey; //whatever
  });
};

const departure_from_normal_string = (metric: number, benchmark: number) => {
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

interface SingleDayLineChartProps {
  data: DataPoints;
  title: string;
  chartId: string;
  metricField: string;
  benchmarkField?: string;
  pointField: string;
  bothStops?: boolean;
}

export const SingleDayLineChart: React.FC<SingleDayLineChartProps> = ({
  chartId,
  title,
  data,
  metricField,
  benchmarkField,
  pointField,
  bothStops = false,
}) => {
  const labels = data.map((item) => item[pointField]);
  return (
    <Line
      id={chartId}
      height={250}
      data={{
        labels,
        datasets: [
          {
            label: `Actual`,
            fill: false,
            pointBackgroundColor: point_colors(data, metricField, benchmarkField),
            pointHoverRadius: 3,
            pointHoverBackgroundColor: point_colors(data, metricField, benchmarkField),
            pointRadius: 3,
            pointHitRadius: 10,
            data: data.map((datapoint) => (datapoint[metricField] / 60).toFixed(2)),
          },
          {
            label: `Benchmark MBTA`,
            data: data.map((datapoint) => (datapoint[benchmarkField] / 60).toFixed(2)),
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
                  tooltipItems[0].parsed.y,
                  tooltipItems[1]?.parsed.y
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
              title,
              { to: 'Park Street', from: 'Porter', direction: 'southbound', line: 'Red' },
              bothStops,
              chart
            );
          },
        },
      ]}
    />
  );
};
