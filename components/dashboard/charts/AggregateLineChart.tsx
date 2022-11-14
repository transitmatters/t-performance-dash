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
import { drawTitle } from './Title';
import { Legend as LegendView, LegendLongTerm } from './Legend';
import { AggregateLineProps } from '../../../types/lines';
import { DownloadButton } from '../../../src/charts/download';
import { AggregatePoint } from '../../../src/charts/types';

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


export const AggregateLineChart: React.FC<AggregateLineProps> = (props, {
    title,
    data,
    location,
    isLoading,
    pointField,
    useBenchmarks,
    titleBothStops,
    fname,
    timeUnit,
    timeFormat,
    seriesName,
    startDate,
    endDate,
    fillColor,
    suggestedYMin,
    suggestedYMax,
    xLabel,
    xMin,
    xMax,
}) => {
  const labels = data.map((item) => item[pointField]);
  return (
    <div className={'chart'}>
    <div className="chart-container">
    <Line
    data={{
      labels,
      datasets: [
        {
          label: seriesName,
          fill: false,
          //Doesn't work?
          tension: 0.1,
          pointBackgroundColor: '#1c1c1c',
          pointHoverRadius: 3,
          pointHoverBackgroundColor: '#1c1c1c',
          pointRadius: 3,
          pointHitRadius: 10,
          data: data.map((item: AggregatePoint) => (item["50%"] / 60).toFixed(2))
        },
        {
          label: "25th percentile",
          fill: 1,
          backgroundColor: fillColor,
          tension: 0.4,
          pointRadius: 0,
          data: data.map((item: AggregatePoint) => (item["25%"] / 60).toFixed(2))
        },
        {
          label: "75th percentile",
          fill: 1,
          backgroundColor: fillColor,
          tension: 0.4,
          pointRadius: 0,
          data: data.map((item: AggregatePoint) => (item["75%"] / 60).toFixed(2))
        },
      ]
    }}
    options={{
      scales: {
        y: {
          title: {
            text: "Minutes"
          },
        suggestedMin: suggestedYMin,
        suggestedMax: suggestedYMax,
        },
        x: {
            time: {
                unit: timeUnit,
                stepSize: 1,
            tooltipFormat: timeFormat
        },
        // Possile should be 'time'
        type: 'timeseries',
        adapters: {
            date: {
              locale: enUS,
            },
          },
          // force graph to show startDate to endDate, even if missing data
          min: xMin,
          max: xMax,
          title: {
            text: xLabel,
          }
        }
      }
    }}
    plugins={[{
      id: 'AggregateLineAfterDrawPlugin',
      afterDraw: (chart: ChartJS) => {
        drawTitle(title, location, titleBothStops, chart);
      }
    }]}
    />
    {/* <DownloadButton
      data={data}
      datasetName={fname}
      location={location}
      bothStops={titleBothStops}
      startDate={startDate}
      endDate={endDate}
    /> */}
    </div>
    <div className="chart-extras">
      <LegendLongTerm />
      {props.children}
    </div>
    </div>
  
  );
};
