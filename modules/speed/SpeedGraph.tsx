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
import { enUS } from 'date-fns/locale';

import { useDelimitatedRoute } from '../../common/utils/router';
import { COLORS, LINE_COLORS } from '../../common/constants/colors';
import {
  CORE_TRACK_LENGTHS,
  DELAYS_RANGE_PARAMS_MAP,
  MINIMUMS,
  PEAK_MPH,
} from './constants/speeds';
import { SpeedDataPoint } from '../../common/types/dataPoints';
import { TimeRange, TimeRangeNames } from '../../common/types/inputs';
import { drawSimpleTitle } from '../../common/components/charts/Title';

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

interface SpeedGraphProps {
  timeRange: TimeRange;
  data: SpeedDataPoint[];
}

export const SpeedGraph: React.FC<SpeedGraphProps> = ({ data, timeRange }) => {
  const { line } = useDelimitatedRoute();
  const { tooltipFormat, unit, startDate, endDate, callbacks } = DELAYS_RANGE_PARAMS_MAP[timeRange];
  const ref = useRef();

  const labels = data.map((point) => point.date);
  return (
    <Line
      id={'Speed'}
      height={240}
      ref={ref}
      redraw={true}
      data={{
        labels,
        datasets: [
          {
            label: `MPH`,
            borderColor: LINE_COLORS[line ?? 'default'],
            pointRadius: 8,
            pointBackgroundColor: 'transparent',
            pointBorderWidth: 0,
            pointHoverRadius: 3,
            pointHoverBackgroundColor: LINE_COLORS[line ?? 'default'],
            data: data.map((datapoint) =>
              (CORE_TRACK_LENGTHS[line ?? 'DEFAULT'] / (datapoint.value / 3600)).toFixed(1)
            ),
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
            suggestedMin: 0,
            suggestedMax: PEAK_MPH[line ?? 'DEFAULT'],
            display: true,
            ticks: {
              color: COLORS.design.subtitleGrey,
            },
            title: {
              display: true,
              text: 'mph',
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
      plugins={[
        {
          id: 'customTitle',
          afterDraw: (chart) => {
            if (startDate === undefined || startDate.length === 0) {
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
            drawSimpleTitle(`Speed`, chart);
          },
        },
      ]}
    />
  );
};
