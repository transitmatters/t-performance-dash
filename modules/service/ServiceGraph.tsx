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
import Annotation from 'chartjs-plugin-annotation';

import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import { useDelimitatedRoute } from '../../common/utils/router';
import { CHART_COLORS, COLORS, LINE_COLORS } from '../../common/constants/colors';
import type { SpeedDataPoint, TripCounts } from '../../common/types/dataPoints';
import { drawSimpleTitle } from '../../common/components/charts/Title';
import { hexWithAlpha } from '../../common/utils/general';
import type { ParamsType } from '../speed/constants/speeds';
import { PEAK_SCHEDULED_SERVICE } from '../../common/constants/service';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { watermarkLayout } from '../../common/constants/charts';
import { getShuttlingBlockAnnotations } from './utils/graphUtils';

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

  const isMobile = !useBreakpoint('md');
  const ref = useRef();

  const labels = data.map((point) => point.date);
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
            label: `Actual trips`,
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
            spanGaps: false,
            data: predictedData.counts.map((count, index) =>
              data[index]?.value > 0 && count ? count / 2 : Number.NaN
            ),
            backgroundColor: pattern.draw('diagonal', '#FFFFFF', lineColor, 5),
          },
          {
            // This null dataset produces the entry in the legend for the baseline annotation.
            label: `Baseline (${PEAK_SCHEDULED_SERVICE[line ?? 'DEFAULT']})`,
            backgroundColor: CHART_COLORS.ANNOTATIONS,
            data: null,
          },
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
        watermark: watermarkLayout(isMobile),
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
            annotations: [
              {
                type: 'line',
                yMin: PEAK_SCHEDULED_SERVICE[line ?? 'DEFAULT'],
                yMax: PEAK_SCHEDULED_SERVICE[line ?? 'DEFAULT'],
                borderColor: CHART_COLORS.ANNOTATIONS,
                display: (ctx) => ctx.chart.isDatasetVisible(2),
                borderWidth: 2,
              },
              ...shuttlingBlocks,
            ],
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
        Annotation,
      ]}
    />
  );
};
