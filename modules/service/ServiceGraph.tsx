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

import { useDelimitatedRoute } from '../../common/utils/router';
import { COLORS, LINE_COLORS } from '../../common/constants/colors';
import type { SpeedDataPoint, TripCounts } from '../../common/types/dataPoints';
import { drawSimpleTitle } from '../../common/components/charts/Title';
import type { ParamsType } from '../speed/constants/speeds';
import { hexWithAlpha } from '../../common/utils/general';

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
            label: `trips`,
            borderColor: LINE_COLORS[line ?? 'default'],
            backgroundColor: `${LINE_COLORS[line ?? 'default']}80`,
            pointRadius: 8,
            pointBackgroundColor: 'transparent',
            pointBorderWidth: 0,
            pointHoverRadius: 3,
            pointHoverBackgroundColor: LINE_COLORS[line ?? 'default'],
            data: data.map((datapoint) => (datapoint.value ? datapoint.count / 2 : -1000000000000)),
          },
          {
            label: `MBTA scheduled trips`,
            fill: true,
            pointBackgroundColor: 'transparent',
            pointBorderWidth: 0,
            spanGaps: true,
            data: predictedData.counts.map((count) => count / 2),
            backgroundColor: hexWithAlpha(LINE_COLORS[line ?? 'default'], 0.5),
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
            display: showTitle,
            text: '',
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
      plugins={[
        {
          id: 'customTitle',
          afterDraw: (chart) => {
            if (!data) {
              // No data is present
              const { ctx } = chart;
              const { width } = chart;
              const { height } = chart;
              chart.clear();

              ctx.save();
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.font = "16px normal 'Helvetica Nueue'";
              ctx.fillText('No data to display', width / 2, height / 2);
              ctx.restore();
            }
            if (showTitle) drawSimpleTitle(`Daily round trips`, chart);
          },
        },
      ]}
    />
  );
};
