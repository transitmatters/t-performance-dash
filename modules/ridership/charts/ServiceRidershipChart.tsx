import React, { useMemo } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import Color from 'chartjs-color';
import pattern from 'patternomaly';
import memoize from 'fast-memoize';

import { Chart } from 'react-chartjs-2';
import type { ChartDataset } from 'chart.js';
import type { LineData } from '../../../common/types/ridership';
import {
  asPercentString,
  getRidershipNoun,
  normalizeToPercent,
} from '../../../common/utils/ridership';
import { COLORS } from '../../../common/constants/colors';

ChartJS.register(...registerables);

interface ServiceRidershipChartProps {
  color: string;
  startDate: Date;
  lineData: LineData | undefined;
}

const dateFormatter = new Intl.DateTimeFormat('en-US');

export const getChartLabels = memoize(
  (startDate: Date) => {
    const now = Date.now();
    const dateStrings: string[] = [];
    const timestamps: number[] = [];
    let time = startDate.valueOf();
    do {
      dateStrings.push(dateFormatter.format(time));
      timestamps.push(time);
      time += 86400 * 1000;
    } while (time <= now);
    return { timestamps, dateStrings };
  },
  { serializer: (d) => d.valueOf().toString() }
);

export const ServiceRidershipChart: React.FC<ServiceRidershipChartProps> = ({
  color,
  startDate,
  lineData,
}) => {
  const { serviceHistory, ridershipHistory } = lineData ?? {};

  const { timestamps } = useMemo(() => getChartLabels(startDate), [startDate]);

  const ridershipPercentage = useMemo(
    () => normalizeToPercent(ridershipHistory ?? []),
    [ridershipHistory]
  );
  const servicePercentage = useMemo(
    () => normalizeToPercent(serviceHistory ?? []),
    [serviceHistory]
  );

  const alphaColor = Color(color).alpha(0.8).rgbString();
  const ridershipNoun = lineData ? getRidershipNoun(lineData.id) : 'riders';

  const datasets: (ChartDataset & { actual: number[]; unit: string })[] = [
    {
      label: 'Ridership',
      actual: ridershipHistory ?? [],
      unit: `weekday ${ridershipNoun}`,
      data: ridershipPercentage ?? [],
      borderColor: color,
      backgroundColor: alphaColor,
      fill: true,
      borderWidth: 2,
    },
    {
      label: 'Service levels',
      actual: serviceHistory ?? [],
      unit: 'weekday trips per direction',
      data: servicePercentage ?? [],
      borderColor: alphaColor,
      backgroundColor: pattern.draw('diagonal', 'rgba(0,0,0,0)', color, 5),
      fill: true,
      borderWidth: 2,
    },
  ].filter((x) => x);

  return (
    <div>
      <Chart
        type={'line'}
        height={200}
        data={{
          datasets,
          labels: timestamps,
        }}
        redraw={true}
        options={{
          maintainAspectRatio: false,
          animation: { duration: 0 },
          scales: {
            x: {
              grid: { display: false },
              type: 'time',
              ticks: {
                color: COLORS.design.subtitleGrey,
              },
              adapters: {
                date: {
                  locale: enUS,
                },
              },
              time: {
                unit: 'month',
                displayFormats: {
                  month: 'MMM yy',
                },
              },
            },
            y: {
              type: 'linear',
              beginAtZero: true,
              ticks: {
                stepSize: 0.2,
                maxTicksLimit: 6,
                callback: asPercentString,
                color: COLORS.design.subtitleGrey,
              },
              grid: { display: false },
            },
          },
          elements: {
            point: { radius: 0 },
            line: { tension: 0 },
          },
          plugins: {
            legend: {
              position: 'top',
              align: 'end',
              labels: {
                boxWidth: 15,
              },
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                title: ([{ dataIndex }]) => {
                  return dateFormatter.format(timestamps[dataIndex]);
                },
                label: ({ datasetIndex, dataIndex, formattedValue }) => {
                  const { label, actual, unit } = datasets[datasetIndex];
                  const valuePercent = Math.round(parseFloat(formattedValue) * 100);
                  return `${label}: ${actual[dataIndex]} ${unit} (${valuePercent}% Pre-COVID)`;
                },
              },
            },
          },
        }}
      />
    </div>
  );
};
