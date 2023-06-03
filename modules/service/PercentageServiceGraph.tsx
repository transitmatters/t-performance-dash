import React, { useMemo, useRef } from 'react';
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

import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import { useDelimitatedRoute } from '../../common/utils/router';
import { CHART_COLORS, COLORS, LINE_COLORS } from '../../common/constants/colors';
import type { SpeedDataPoint } from '../../common/types/dataPoints';
import { drawSimpleTitle } from '../../common/components/charts/Title';
import { hexWithAlpha } from '../../common/utils/general';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import type { ParamsType } from '../speed/constants/speeds';
import { ChartBorder } from '../../common/components/charts/ChartBorder';
import { ChartDiv } from '../../common/components/charts/ChartDiv';
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

interface PercentageServiceGraphProps {
  data: SpeedDataPoint[];
  calculatedData: { scheduled: number[]; baseline: number[] };
  config: ParamsType;
  startDate: string;
  endDate: string;
  comparison: 'Baseline' | 'Scheduled';
  showTitle?: boolean;
}

export const PercentageServiceGraph: React.FC<PercentageServiceGraphProps> = ({
  data,
  calculatedData,
  config,
  startDate,
  endDate,
  comparison,
  showTitle = false,
}) => {
  const { line } = useDelimitatedRoute();
  const { tooltipFormat, unit, callbacks } = config;

  const isMobile = !useBreakpoint('md');
  const ref = useRef();

  const chart = useMemo(() => {
    const labels = data.map((point) => point.date);
    const lineColor = LINE_COLORS[line ?? 'default'];
    const shuttlingBlocks = getShuttlingBlockAnnotations(data);
    const compareToScheduled = comparison === 'Scheduled';
    return (
      <ChartBorder>
        <ChartDiv isMobile={isMobile}>
          <Line
            id={'Service'}
            height={isMobile ? 200 : 240}
            ref={ref}
            redraw={true}
            data={{
              labels,
              datasets: [
                {
                  label: `% of ${comparison}`,
                  borderColor: lineColor,
                  pointRadius: 8,
                  pointBackgroundColor: 'transparent',
                  pointBorderWidth: 0,
                  stepped: true,
                  fill: true,
                  pointHoverRadius: 3,
                  pointHoverBackgroundColor: lineColor,
                  backgroundColor: hexWithAlpha(lineColor, 0.8),
                  data: compareToScheduled ? calculatedData.scheduled : calculatedData.baseline,
                },
                {
                  // This null dataset produces the entry in the legend for the baseline annotation.
                  label: `100%`,
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
                  annotations: [
                    {
                      type: 'line',
                      yMin: 100,
                      yMax: 100,
                      borderColor: CHART_COLORS.ANNOTATIONS,
                      // corresponds to null dataset index.
                      display: (ctx) => ctx.chart.isDatasetVisible(1),
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
        </ChartDiv>
      </ChartBorder>
    );
  }, [
    data,
    calculatedData.scheduled,
    calculatedData.baseline,
    callbacks,
    comparison,
    endDate,
    isMobile,
    line,
    showTitle,
    startDate,
    tooltipFormat,
    unit,
  ]);
  return chart;
};
