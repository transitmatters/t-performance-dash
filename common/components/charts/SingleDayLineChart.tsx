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
import React, { useMemo, useRef } from 'react';
import type { DataPoint } from '../../types/dataPoints';
import { CHART_COLORS, COLORS, LINE_COLORS } from '../../../common/constants/colors';
import type { SingleDayLineProps } from '../../../common/types/charts';
import { prettyDate } from '../../utils/date';
import { useDelimitatedRoute } from '../../utils/router';
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
  location,
  homescreen = false,
  showLegend = true,
}) => {
  const ref = useRef();
  const labels = useMemo(() => data.map((item) => item[pointField]), [data, pointField]);
  const { line } = useDelimitatedRoute();
  return (
    <div className={showLegend ? 'chart' : undefined}>
      <div className={'chart-container'}>
        <Line
          id={chartId}
          ref={ref}
          height={250}
          redraw={true}
          data={{
            labels,
            datasets: [
              {
                label: `Actual`,
                fill: false,
                borderColor: '#a0a0a030',
                pointBackgroundColor:
                  homescreen && line
                    ? LINE_COLORS[line]
                    : pointColors(data, metricField, benchmarkField),
                pointBorderWidth: homescreen ? 0 : undefined,
                pointHoverRadius: 3,
                pointHoverBackgroundColor:
                  homescreen && line
                    ? LINE_COLORS[line]
                    : pointColors(data, metricField, benchmarkField),
                pointRadius: 3,
                pointHitRadius: 10,
                // TODO: would be nice to add types to these arrow functions - but causes an issue bc datapoint[field] might be undefined.
                data: data.map((datapoint: any) => (datapoint[metricField] / 60).toFixed(2)),
              },
              {
                label: `Benchmark MBTA`,
                backgroundColor: '#a0a0a030',
                data: benchmarkField
                  ? data.map((datapoint: any) => (datapoint[benchmarkField] / 60).toFixed(2))
                  : [],
                pointRadius: 0,
                pointHoverRadius: 3,
                fill: true,
                hidden: benchmarkField === undefined,
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
                  label: (tooltipItem) => {
                    if (
                      tooltipItem.parsed.y === 0 &&
                      tooltipItem.dataset.label === 'Benchmark MBTA'
                    ) {
                      return '';
                    }
                    return `${tooltipItem.dataset.label}: ${tooltipItem.parsed.y} minutes`;
                  },
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
                time: {
                  unit: 'hour',
                  tooltipFormat: 'h:mm:ss a', // locale time with seconds
                },
                ticks: {
                  color: COLORS.design.subtitleGrey,
                },
                adapters: {
                  date: {
                    locale: enUS,
                  },
                },
                display: true,
                title: {
                  display: true,
                  text: date ? prettyDate(date, true) : 'No date selected',
                  color: COLORS.design.subtitleGrey,
                },
                afterDataLimits: (axis) => {
                  const today = new Date(`${date}T00:00:00`);
                  const low = new Date(today);
                  low.setHours(6);
                  axis.min = Math.min(axis.min, low.valueOf());
                  const high = new Date(today);
                  high.setDate(high.getDate() + 1);
                  high.setHours(1);
                  high.setMinutes(15);
                  axis.max = Math.max(axis.max, high.valueOf());
                },
              },
            },
            // animation: false,
          }}
          plugins={[
            {
              id: 'customTitle',
              afterDraw: (chart) => {
                if ((date === undefined || date.length === 0) && !isLoading) {
                  // No data is present
                  const ctx = chart.ctx;
                  const width = chart.width;
                  const height = chart.height;
                  chart.clear();

                  ctx.save();
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.font = "16px normal 'Helvetica Nueue'";
                  ctx.fillText('No data to display', width / 2, height / 2);
                  ctx.restore();
                }
                drawTitle(title, location, bothStops, chart);
              },
            },
          ]}
        />
      </div>
      {showLegend && <div className="chart-extras">{benchmarkField && <LegendView />}</div>}
    </div>
  );
};
