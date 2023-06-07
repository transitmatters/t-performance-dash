import React, { useMemo } from 'react';
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
import type { SpeedDataPoint } from '../../../common/types/dataPoints';
import { SPEED_RANGE_PARAM_MAP } from '../../speed/constants/speeds';
import { convertToSpeedDataset } from '../utils';
import { LandingChartDiv } from '../LandingChartDiv';

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

interface OverallSpeedChartProps {
  speedData: SpeedDataPoint[][];
}
export const OverallSpeedChart: React.FC<OverallSpeedChartProps> = ({ speedData }) => {
  const chart = useMemo(() => {
    const labels = speedData[0].map((point) => point.date);
    const datasets = speedData.map((data) => convertToSpeedDataset(data));
    const { tooltipFormat, unit, callbacks } = SPEED_RANGE_PARAM_MAP.week;

    return (
      <LandingChartDiv>
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
      </LandingChartDiv>
    );
  }, [speedData]);
  return chart;
};
