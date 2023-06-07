import React from 'react';
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

import { THREE_MONTHS_AGO_STRING, TODAY_STRING } from '../../../common/constants/dates';
import { COLORS } from '../../../common/constants/colors';
import type { RidershipCount } from '../../../common/types/dataPoints';
import type { Line as LineType } from '../../../common/types/lines';
import { SPEED_RANGE_PARAM_MAP } from '../../speed/constants/speeds';
import { convertToRidershipDataset } from '../utils';

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

interface OverallRidershipChartProps {
  ridershipData: { line: LineType; data: RidershipCount[] }[];
}
export const OverallRidershipChart: React.FC<OverallRidershipChartProps> = ({ ridershipData }) => {
  const labels = ridershipData[0].data.map((point) => point.date);
  const datasets = ridershipData.map((item) => convertToRidershipDataset(item.data, item.line));
  const { tooltipFormat, unit, callbacks } = SPEED_RANGE_PARAM_MAP.week;

  return (
    <div className="h-[300px] w-full max-w-2xl px-16">
      <Line
        id={'system-speed'}
        height={240}
        redraw={true}
        data={{
          labels,
          datasets: datasets,
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
          },
          plugins: {
            tooltip: {
              mode: 'index',
              position: 'nearest',
              callbacks: {
                label: (value) => `${value.formattedValue}% of baseline`,
                ...callbacks,
              },
            },
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              suggestedMax: 100,
              display: true,
              grid: { display: false },

              ticks: {
                color: COLORS.design.lightGrey,
                callback: (value) => `${value}%`,
              },
              title: {
                display: true,
                text: 'Percentage of baseline',
                color: COLORS.design.lightGrey,
              },
            },
            x: {
              min: THREE_MONTHS_AGO_STRING,
              max: TODAY_STRING,
              type: 'time',
              grid: { display: false },

              time: {
                unit: unit,
                tooltipFormat: tooltipFormat,
              },
              ticks: {
                color: COLORS.design.lightGrey,
              },
              adapters: {
                date: {
                  locale: enUS,
                },
              },
              display: true,
              title: {
                display: false,
                text: ``,
              },
            },
          },
        }}
      />
    </div>
  );
};
