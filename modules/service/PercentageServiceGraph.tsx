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
import Annotation from 'chartjs-plugin-annotation';
import pattern from 'patternomaly';

import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import { useDelimitatedRoute } from '../../common/utils/router';
import { COLORS, LINE_COLORS } from '../../common/constants/colors';
import type { SpeedDataPoint, TripCounts } from '../../common/types/dataPoints';
import { drawSimpleTitle } from '../../common/components/charts/Title';
import { hexWithAlpha } from '../../common/utils/general';
import type { ParamsType } from '../speed/constants/speeds';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { getShuttlingBlockAnnotations } from './utils/graphUtils';
import { PEAK_SCHEDULED_SERVICE } from '../../common/constants/service';

ChartJS.register(
  CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Annotation,
  Filler,
  Title,
  Tooltip,
  Legend,
  ChartjsPluginWatermark
);

interface PercentageServiceGraphProps {
  data: SpeedDataPoint[];
  predictedData: TripCounts;
  config: ParamsType;
  startDate: string;
  endDate: string;
  showTitle?: boolean;
}

export const PercentageServiceGraph: React.FC<PercentageServiceGraphProps> = ({
  data,
  predictedData,
  config,
  startDate,
  endDate,
  showTitle = false,
}) => {
  const { line } = useDelimitatedRoute();
  const { tooltipFormat, unit, callbacks } = config;

  const isMobile = !useBreakpoint('md');
  const ref = useRef();

  const labels = data.map((point) => point.date);
  const percentOfScheduledData = data.map((datapoint, index) =>
    datapoint.value ? (100 * datapoint.count) / predictedData.counts[index] : Number.NaN
  );
  const percentOfBaselineData = data.map((datapoint, index) =>
    datapoint.value
      ? (100 * datapoint.count) / 2 / PEAK_SCHEDULED_SERVICE[line ?? 'DEFAULT']
      : Number.NaN
  );
  const lineColor = LINE_COLORS[line ?? 'default'];
  const shuttlingBlocks = getShuttlingBlockAnnotations(data);
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
            label: `% of scheduled`,
            borderColor: lineColor,
            pointRadius: 8,
            pointBackgroundColor: 'transparent',
            pointBorderWidth: 0,
            stepped: true,
            fill: true,
            pointHoverRadius: 3,
            pointHoverBackgroundColor: lineColor,
            backgroundColor: hexWithAlpha(lineColor, 0.8),
            data: percentOfScheduledData,
          },
          // {
          //   label: `% of baseline`,
          //   borderColor: lineColor,
          //   backgroundColor: hexWithAlpha(lineColor, 0.8),
          //   pointRadius: 8,
          //   pointBackgroundColor: 'transparent',
          //   pointBorderWidth: 0,
          //   stepped: true,
          //   fill: true,
          //   pointHoverRadius: 3,
          //   pointHoverBackgroundColor: lineColor,
          //   data: percentOfBaselineData,
          // },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: showTitle ? 25 : 0,
          },
        },
        interaction: {
          intersect: false,
        },
        // @ts-expect-error The watermark plugin doesn't have typescript support
        watermark: {
          image: new URL('/Logo_wordmark.png', window.location.origin).toString(),
          x: 10,
          y: 10,
          opacity: 0.2,
          width: isMobile ? 120 : 160,
          height: isMobile ? 11.25 : 15,
          alignToChartArea: true,
          alignX: 'right',
          alignY: 'top',
          position: 'back',
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
          title: {
            // empty title to set font and leave room for drawTitle fn
            display: showTitle,
            text: '',
          },
          annotation: {
            // Add your annotations here
            annotations: [...shuttlingBlocks],
          },
        },
        scales: {
          y: {
            min: 0,
            display: true,
            ticks: {
              color: COLORS.design.subtitleGrey,
              callback: (value) => `${value}%`,
            },
            title: {
              display: true,
              text: 'Percentage',
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
        Annotation,
      ]}
    />
  );
};