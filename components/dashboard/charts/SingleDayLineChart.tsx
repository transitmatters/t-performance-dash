import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import React from 'react';
import { DataPoint } from '../../../types/dataPoints';
import { CHART_COLORS } from '../../../utils/constants';
import { SingleDayLineProps } from '../../../types/lines';
import { prettyDate } from '../../utils/Date';
import { drawTitle } from './Title';
import { Legend as LegendView } from './Legend';

ChartJS.register(
  CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

const pointColors = (data: DataPoint[], metric_field: string, benchmark_field?: string) => {
  return data.map((point: DataPoint) => {
    if (benchmark_field) {
      const ratio = point[metric_field] / point[benchmark_field];
      if (point[benchmark_field] === null) {
        return CHART_COLORS.GREY; //grey
      } else if (ratio <= 1.25) {
        return CHART_COLORS.GREEN; //green
      } else if (ratio <= 1.5) {
        return CHART_COLORS.YELLOW; //yellow
      } else if (ratio <= 2.0) {
        return CHART_COLORS.RED; //red
      } else if (ratio > 2.0) {
        return CHART_COLORS.PURPLE; //purple
      }
    }

    return CHART_COLORS.GREY; //whatever
  });
};

const departureFromNormalString = (metric: number, benchmark: number) => {
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
  return '';
};

export const SingleDayLineChart: React.FC<SingleDayLineProps> = ({
  chartId,
  title,
  data,
  date,
  metricField,
  pointField,
  benchmarkField,
  // TODO: loading animation?
  isLoading,
  bothStops = false,
}) => {
  const labels = data.map((item) => item[pointField]);
  return (
    <div className={'chart'}>
      <div className="chart-container">
        <div>
          <Line
            id={chartId}
            height={250}
            data={{
              labels,
              datasets: [
                {
                  label: `Actual`,
                  fill: false,
                  pointBackgroundColor: pointColors(data, metricField, benchmarkField),
                  pointHoverRadius: 3,
                  pointHoverBackgroundColor: pointColors(data, metricField, benchmarkField),
                  pointRadius: 3,
                  pointHitRadius: 10,
                  // TODO: would be nice to add types to these arrow functions - but causes an issue bc datapoint[field] might be undefined.
                  data: data.map((datapoint: any) => (datapoint[metricField] / 60).toFixed(2)),
                },
                {
                  label: `Benchmark MBTA`,
                  data: benchmarkField
                    ? data.map((datapoint: any) => (datapoint[benchmarkField] / 60).toFixed(2))
                    : [],
                  pointRadius: 0,
                  pointHoverRadius: 3,
                  fill: true,
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
                      return departureFromNormalString(
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
                    text: prettyDate(date, true),
                  },

                  afterDataLimits: (axis) => {
                    const today = new Date(`${date}T00:00:00`);
                    const low = new Date(today);
                    low.setHours(6);
                    axis.min = Math.min(axis.min, low.valueOf());
                    const high = new Date(today);
                    high.setDate(high.getDate() + 1);
                    high.setHours(1);
                    axis.max = Math.max(axis.max, high.valueOf());
                  },
                },
              },
              animation: false,
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
        </div>
        <div className="chart-extras">{benchmarkField && <LegendView />}</div>
      </div>
    </div>
  );
};
