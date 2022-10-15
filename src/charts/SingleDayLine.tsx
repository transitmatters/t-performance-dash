import React from 'react';
import classNames from 'classnames';
import { Line } from 'react-chartjs-2';
import { Legend } from './Legend';
import { drawTitle } from './Title';
import { writeError } from './error';
import { DownloadButton } from './download';
import { prettyDate, departure_from_normal_string, point_colors } from './lineUtils';
import type { DataPoint, Location, BenchmarkField, YField, XField } from './types';

interface SingleDayLineProps {
  title: string;
  data: DataPoint[];
  isLoading: boolean;
  seriesName: string;
  xField: XField;
  yField: YField;
  benchmarkField: BenchmarkField;
  fname: string;
  location: Location;
  titleBothStops: boolean;
  useBenchmarks: boolean;
  date: string;
}

export const SingleDayLine: React.FC<SingleDayLineProps> = ({
  title,
  titleBothStops,
  data,
  date,
  isLoading,
  seriesName,
  xField,
  yField,
  benchmarkField,
  fname,
  useBenchmarks,
  location,
}) => {
  const labels = data.map((item) => item[xField]);

  return (
    <div className={classNames('chart', isLoading && 'is-loading')}>
      <div className="chart-container">
        <Line
          data={{
            labels,
            datasets: [
              {
                label: `Actual ${seriesName}`,
                fill: false,
                lineTension: 0.1,
                pointBackgroundColor: point_colors(data, yField, benchmarkField),
                pointHoverRadius: 3,
                pointHoverBackgroundColor: point_colors(data, yField, benchmarkField),
                pointRadius: 3,
                pointHitRadius: 10,
                data: data.map((item) => (item[yField] / 60).toFixed(2)),
              },
              {
                label: `Benchmark MBTA ${seriesName}`,
                // @ts-expect-error Benchmark field can be null
                data: useBenchmarks && data.map((item) => (item[benchmarkField] / 60).toFixed(2)),
                pointRadius: 0,
              },
            ],
          }}
          options={{
            tooltips: {
              // TODO: tooltip is under title words
              callbacks: {
                afterBody: (tooltipItems: any[]) => {
                  return departure_from_normal_string(
                    tooltipItems[0].value,
                    tooltipItems[1]?.value
                  );
                },
              },
            },
            scales: {
              yAxes: [
                {
                  scaleLabel: {
                    labelString: 'Minutes',
                  },
                },
              ],
              xAxes: [
                {
                  type: 'time',
                  time: {
                    unit: 'hour',
                    unitStepSize: 1,
                    tooltipFormat: 'LTS', // locale time with seconds
                  },
                  scaleLabel: {
                    labelString: prettyDate(date, true),
                  },
                  // make sure graph shows /at least/ 6am today to 1am tomorrow
                  afterDataLimits: (axis: any) => {
                    if (isLoading) {
                      return; // prevents weird sliding animation
                    }
                    const today = new Date(`${date}T00:00:00`);
                    const low = new Date(today);
                    low.setHours(6, 0);
                    const high = new Date(today);
                    high.setDate(high.getDate() + 1);
                    high.setHours(1, 0);
                    axis.min = Math.min(axis.min, low.getTime()) || null;
                    axis.max = Math.max(axis.max, high.getTime()) || null;
                  },
                },
              ],
            },
          }}
          plugins={[
            {
              afterDraw: (chart: any) => {
                drawTitle(title, location, titleBothStops, chart);
                if (!isLoading && !data.length) {
                  writeError(chart);
                }
              },
            },
          ]}
        />
        {/* @ts-expect-error DownloadButton isn't yet TS but has optional props */}
        <DownloadButton
          data={data}
          datasetName={fname}
          location={location}
          bothStops={titleBothStops}
          startDate={date}
        />
      </div>
      <div className="chart-extras">{useBenchmarks && <Legend />}</div>
    </div>
  );
};
