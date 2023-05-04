import React, { useRef } from 'react';
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
import pattern from 'patternomaly';

import { useDelimitatedRoute } from '../../common/utils/router';
import { COLORS, LINE_COLORS } from '../../common/constants/colors';
import type { SpeedDataPoint, TripCounts } from '../../common/types/dataPoints';
import { drawSimpleTitle } from '../../common/components/charts/Title';
import { hexWithAlpha } from '../../common/utils/general';
import type { ParamsType } from '../speed/constants/speeds';

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

interface ServiceGraphProps {
  data: SpeedDataPoint[];
  predictedData: TripCounts;
  config: ParamsType;
  startDate: string;
  endDate: string;
  showTitle?: boolean;
}

export const ServiceGraph: React.FC<ServiceGraphProps> = ({
  data,
  predictedData,
  config,
  startDate,
  endDate,
  showTitle = false,
}) => {
  const { line } = useDelimitatedRoute();
  const { tooltipFormat, unit, callbacks } = config;
  const ref = useRef();
  const labels = data.map((point) => point.date);
  const lineColor = LINE_COLORS[line ?? 'default'];
  return (
    <Line
      id={'Service'}
      height={240}
      ref={ref}
      redraw={true}
      data={{
        labels,
        datasets: [
          {
            label: `Observed trips`,
            borderColor: lineColor,
            backgroundColor: hexWithAlpha(lineColor, 0.8),
            pointRadius: 8,
            pointBackgroundColor: 'transparent',
            pointBorderWidth: 0,
            stepped: true,
            fill: true,
            pointHoverRadius: 3,
            pointHoverBackgroundColor: lineColor,
            data: data.map((datapoint) => (datapoint.value ? datapoint.count / 2 : Number.NaN)),
          },
          {
            label: `MBTA scheduled trips`,
            stepped: true,
            fill: true,
            pointBackgroundColor: 'transparent',
            pointBorderWidth: 0,
            borderColor: lineColor,
            spanGaps: true,
            data: predictedData.counts.map((count, index) =>
              data[index]?.value > 0 && count ? count / 2 : Number.NaN
            ),
            backgroundColor: pattern.draw('diagonal', '#FFFFFF', lineColor, 5),
          },
        ],
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
            callbacks: callbacks,
          },
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 15,
            },
          },
        },
        scales: {
          y: {
            min: 0,
            display: true,
            ticks: {
              color: COLORS.design.subtitleGrey,
            },
            title: {
              display: true,
              text: 'trips',
              color: COLORS.design.subtitleGrey,
            },
          },
          x: {
            min: startDate,
            max: endDate,
            type: 'time',
            time: {
              unit: unit,
              tooltipFormat: tooltipFormat,
              displayFormats: {
                month: 'MMM',
              },
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
              display: false,
              text: ``,
            },
          },
        },
      }}
    />
  );
};
