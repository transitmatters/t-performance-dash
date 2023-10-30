import React from 'react';

import { CHART_COLORS, COLORS } from '../../../constants/colors';
import { TimeSeriesChart } from './TimeSeriesChart';

export default {
  title: 'TimeSeriesChart',
  component: TimeSeriesChart,
};

const simpleDataByWeek = [
  {
    label: 'Things',
    data: [
      { date: '2023-01-01', value: 115 },
      { date: '2023-01-08', value: 100 },
      { date: '2023-01-15', value: 85 },
      { date: '2023-01-22', value: 70 },
      { date: '2023-01-29', value: 75 },
      { date: '2023-02-05', value: 90 },
      { date: '2023-02-12', value: 105 },
      { date: '2023-02-19', value: 115 },
      { date: '2023-02-26', value: 120 },
      { date: '2023-03-05', value: 115 },
      { date: '2023-03-12', value: 100 },
      { date: '2023-03-19', value: 85 },
      { date: '2023-03-26', value: 70 },
      { date: '2023-04-02', value: 75 },
      { date: '2023-04-09', value: 90 },
      { date: '2023-04-16', value: 105 },
      { date: '2023-04-23', value: 115 },
      { date: '2023-04-30', value: 120 },
    ],
  },
  {
    label: 'Stuff',
    data: [
      { date: '2023-01-01', value: 125 },
      { date: '2023-01-08', value: 115 },
      { date: '2023-01-15', value: 105 },
      { date: '2023-01-22', value: 100 },
      { date: '2023-01-29', value: 105 },
      { date: '2023-02-05', value: 120 },
      { date: '2023-02-12', value: 130 },
      { date: '2023-02-19', value: 135 },
      { date: '2023-02-26', value: 140 },
      { date: '2023-03-05', value: 135 },
      { date: '2023-03-12', value: 125 },
      { date: '2023-03-19', value: 115 },
      { date: '2023-03-26', value: 110 },
      { date: '2023-04-02', value: 115 },
      { date: '2023-04-09', value: 125 },
      { date: '2023-04-16', value: 135 },
      { date: '2023-04-23', value: 140 },
      { date: '2023-04-30', value: 145 },
    ],
    style: {
      fillPattern: 'striped' as const,
    },
  },
];

const simpleDataByDay = [
  {
    label: '25th percentile',
    data: [
      { date: '2023-10-01', value: 810.0 / 60 },
      { date: '2023-10-02', value: 490.0 / 60 },
      { date: '2023-10-03', value: 511.5 / 60 },
      { date: '2023-10-04', value: 478.8 / 60 },
      { date: '2023-10-05', value: 505.5 / 60 },
      { date: '2023-10-06', value: 492.0 / 60 },
      { date: '2023-10-07', value: 801.3 / 60 },
      { date: '2023-10-08', value: 803.0 / 60 },
      { date: '2023-10-09', value: 607.0 / 60 },
      { date: '2023-10-10', value: 496.0 / 60 },
      { date: '2023-10-11', value: 490.3 / 60 },
      { date: '2023-10-12', value: 509.0 / 60 },
      { date: '2023-10-13', value: 484.8 / 60 },
      { date: '2023-10-14', value: 764.3 / 60 },
      { date: '2023-10-15', value: 778.0 / 60 },
      { date: '2023-10-16', value: 628.0 / 60 },
      { date: '2023-10-17', value: 620.8 / 60 },
      { date: '2023-10-18', value: 602.3 / 60 },
      { date: '2023-10-19', value: 628.8 / 60 },
    ],
    style: {
      tension: 0.4,
      fillColor: '#ffffff',
    },
  },
  {
    label: '50th percentile',
    data: [
      { date: '2023-10-01', value: 841.0 / 60 },
      { date: '2023-10-02', value: 550.5 / 60 },
      { date: '2023-10-03', value: 547.5 / 60 },
      { date: '2023-10-04', value: 550.0 / 60 },
      { date: '2023-10-05', value: 547.5 / 60 },
      { date: '2023-10-06', value: 538.0 / 60 },
      { date: '2023-10-07', value: 843.5 / 60 },
      { date: '2023-10-08', value: 841.0 / 60 },
      { date: '2023-10-09', value: 655.5 / 60 },
      { date: '2023-10-10', value: 560.0 / 60 },
      { date: '2023-10-11', value: 544.0 / 60 },
      { date: '2023-10-12', value: 561.0 / 60 },
      { date: '2023-10-13', value: 548.0 / 60 },
      { date: '2023-10-14', value: 819.0 / 60 },
      { date: '2023-10-15', value: 815.0 / 60 },
      { date: '2023-10-16', value: 679.0 / 60 },
      { date: '2023-10-17', value: 667.0 / 60 },
      { date: '2023-10-18', value: 665.0 / 60 },
      { date: '2023-10-19', value: 653.0 / 60 },
    ],
    style: {
      tension: 0.1,
      pointRadius: 3,
      color: '#bbb',
      pointColor: 'black',
    },
  },
  {
    label: '75th percentile',
    data: [
      { date: '2023-10-01', value: 885.3 / 60 },
      { date: '2023-10-02', value: 618.3 / 60 },
      { date: '2023-10-03', value: 611.5 / 60 },
      { date: '2023-10-04', value: 632.3 / 60 },
      { date: '2023-10-05', value: 606.3 / 60 },
      { date: '2023-10-06', value: 586.0 / 60 },
      { date: '2023-10-07', value: 885.8 / 60 },
      { date: '2023-10-08', value: 904.8 / 60 },
      { date: '2023-10-09', value: 701.0 / 60 },
      { date: '2023-10-10', value: 634.0 / 60 },
      { date: '2023-10-11', value: 588.5 / 60 },
      { date: '2023-10-12', value: 618.0 / 60 },
      { date: '2023-10-13', value: 614.0 / 60 },
      { date: '2023-10-14', value: 856.8 / 60 },
      { date: '2023-10-15', value: 858.0 / 60 },
      { date: '2023-10-16', value: 727.0 / 60 },
      { date: '2023-10-17', value: 716.8 / 60 },
      { date: '2023-10-18', value: 714.3 / 60 },
      { date: '2023-10-19', value: 694.3 / 60 },
    ],
    style: {
      tension: 0.4,
      fillColor: CHART_COLORS.FILL,
    },
  },
];

const simpleDataByTime = [
  {
    label: 'Travel Times',
    data: [
      { time: '2023-10-19T08:15:32.000Z', value: 6.731 },
      { time: '2023-10-19T09:23:17.000Z', value: 7.942 },
      { time: '2023-10-19T10:46:58.000Z', value: 5.367 },
      { time: '2023-10-19T11:33:45.000Z', value: 5.812 },
      { time: '2023-10-19T13:04:20.000Z', value: 6.238 },
      { time: '2023-10-19T14:29:57.000Z', value: 5.451 },
      { time: '2023-10-19T15:18:12.000Z', value: 7.123 },
      { time: '2023-10-19T16:57:09.000Z', value: 5.891 },
      { time: '2023-10-19T17:40:38.000Z', value: 6.802 },
      { time: '2023-10-19T18:52:46.000Z', value: 7.512 },
      { time: '2023-10-19T19:27:14.000Z', value: 6.229 },
      { time: '2023-10-19T20:38:05.000Z', value: 5.284 },
      { time: '2023-10-19T21:17:33.000Z', value: 5.991 },
      { time: '2023-10-19T22:45:29.000Z', value: 5.482 },
      { time: '2023-10-19T23:09:41.000Z', value: 6.927 },
      { time: '2023-10-20T00:31:12.000Z', value: 6.148 },
      { time: '2023-10-20T01:21:29.000Z', value: 5.687 },
      { time: '2023-10-20T02:53:07.000Z', value: 5.316 },
      { time: '2023-10-20T03:37:28.000Z', value: 12.431 },
      { time: '2023-10-20T04:59:16.000Z', value: 5.723 },
      { time: '2023-10-20T05:12:45.000Z', value: 6.543 },
      { time: '2023-10-20T06:47:02.000Z', value: 7.654 },
      { time: '2023-10-20T07:38:20.000Z', value: 6.891 },
      { time: '2023-10-20T08:57:38.000Z', value: 7.912 },
      { time: '2023-10-20T09:46:01.000Z', value: 6.316 },
      { time: '2023-10-20T10:27:03.000Z', value: 6.752 },
      { time: '2023-10-20T11:58:47.000Z', value: 6.921 },
      { time: '2023-10-20T12:19:50.000Z', value: 5.813 },
      { time: '2023-10-20T13:47:37.000Z', value: 5.267 },
      { time: '2023-10-20T14:36:53.000Z', value: 16.012 },
      { time: '2023-10-20T15:57:08.000Z', value: 7.123 },
      { time: '2023-10-20T16:34:39.000Z', value: 5.891 },
      { time: '2023-10-20T17:10:54.000Z', value: 6.802 },
      { time: '2023-10-20T18:21:06.000Z', value: 7.512 },
      { time: '2023-10-20T19:43:45.000Z', value: 6.229 },
      { time: '2023-10-20T20:15:20.000Z', value: 5.284 },
      { time: '2023-10-20T21:33:46.000Z', value: 5.991 },
      { time: '2023-10-20T22:19:15.000Z', value: 5.482 },
      { time: '2023-10-20T23:54:23.000Z', value: 6.927 },
      { time: '2023-10-21T00:21:01.000Z', value: 6.148 },
      { time: '2023-10-21T01:35:28.000Z', value: 5.687 },
      { time: '2023-10-21T02:07:14.000Z', value: 5.316 },
      { time: '2023-10-21T03:09:19.000Z', value: 5.894 },
      { time: '2023-10-21T04:27:04.000Z', value: 5.723 },
      { time: '2023-10-21T05:05:59.000Z', value: 6.543 },
      { time: '2023-10-21T06:43:57.000Z', value: 7.654 },
    ],
    style: {
      color: '#ccc',
      pointRadius: 4,
      pointColor: {
        byPoint: (point) => {
          const { value } = point;
          if (value > 10) {
            return CHART_COLORS.RED;
          }
          if (value > 7) {
            return CHART_COLORS.YELLOW;
          }
          return CHART_COLORS.GREEN;
        },
      },
    },
  },
];

export const ByWeek = () => {
  return (
    <TimeSeriesChart
      data={simpleDataByWeek}
      benchmarks={[{ label: 'Best day ever', value: 175 }]}
      blocks={[{ from: '2023-02-19', to: '2023-03-05' }]}
      style={{ stepped: true, fill: true, color: COLORS.mbta.red }}
      timeAxis={{ granularity: 'week' }}
      valueAxis={{ label: 'Trips', min: 0, max: 200 }}
    />
  );
};

export const ByDay = () => {
  return (
    <TimeSeriesChart
      data={simpleDataByDay}
      timeAxis={{ granularity: 'day' }}
      valueAxis={{ label: 'Headways (min)' }}
      legend={{ visible: false }}
      grid={{ zIndex: 1 }}
      style={{
        tension: 1,
        tooltipLabel: ({ value }, { dataset: { label } }) =>
          `${label}: ${Math.round(10 * value) / 10} min`,
      }}
    />
  );
};

export const ByTime = () => {
  return (
    <TimeSeriesChart
      data={simpleDataByTime}
      timeAxis={{ granularity: 'time' }}
      legend={{ visible: false }}
      valueAxis={{ label: 'Travel times' }}
    />
  );
};
