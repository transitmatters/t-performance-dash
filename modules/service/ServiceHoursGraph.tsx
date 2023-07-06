import React, { useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import pattern from 'patternomaly';
import Annotation from 'chartjs-plugin-annotation';
import ChartjsPluginWatermark from 'chartjs-plugin-watermark';

import { useDelimitatedRoute } from '../../common/utils/router';
import { CHART_COLORS, COLORS, LINE_COLORS } from '../../common/constants/colors';
import type { SpeedByLine, TripCounts } from '../../common/types/dataPoints';
import { drawSimpleTitle } from '../../common/components/charts/Title';
import { hexWithAlpha } from '../../common/utils/general';
import type { ParamsType } from '../speed/constants/speeds';
import { PEAK_SCHEDULED_SERVICE } from '../../common/constants/baselines';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { watermarkLayout } from '../../common/constants/charts';
import { ChartBorder } from '../../common/components/charts/ChartBorder';
import { ChartDiv } from '../../common/components/charts/ChartDiv';
import { getShuttlingBlockAnnotations } from './utils/graphUtils';

interface ServiceHoursGraphProps {
  data: SpeedByLine[];
  predictedData: TripCounts;
  config: ParamsType;
  startDate: string;
  endDate: string;
  showTitle?: boolean;
}

export const ServiceHoursGraph: React.FC<ServiceHoursGraphProps> = ({
  data,
  predictedData,
  config,
  startDate,
  endDate,
  showTitle = false,
}) => {
  const { line, linePath } = useDelimitatedRoute();
  const peak = PEAK_SCHEDULED_SERVICE[line ?? 'DEFAULT'];
  const { tooltipFormat, unit, callbacks } = config;

  const isMobile = !useBreakpoint('md');
  const ref = useRef();

  const chart = useMemo(() => {
    const labels = data.map((point) => point.date);
    const lineColor = LINE_COLORS[line ?? 'default'];
    const shuttlingBlocks = getShuttlingBlockAnnotations(data);
    return (
      <ChartBorder>
        <ChartDiv isMobile={isMobile}>
          <Line
            id={`service-${linePath}`}
            height={isMobile ? 200 : 240}
            ref={ref}
            redraw={true}
            data={{
              labels,
              datasets: [
                {
                  label: `Daily round trips`,
                  borderColor: lineColor,
                  backgroundColor: hexWithAlpha(lineColor, 0.8),
                  pointRadius: 0,
                  pointBorderWidth: 0,
                  stepped: true,
                  fill: true,
                  pointHoverRadius: 6,
                  pointHoverBackgroundColor: lineColor,
                  data: data.map((datapoint) =>
                    datapoint.miles_covered ? Math.round(datapoint.count) : Number.NaN
                  ),
                },
                {
                  label: `MBTA scheduled trips`,
                  stepped: true,
                  fill: true,
                  pointBorderWidth: 0,
                  pointRadius: 0,
                  pointHoverRadius: 6,

                  borderColor: lineColor,
                  spanGaps: false,
                  data: predictedData.counts.map((count, index) =>
                    data[index]?.miles_covered > 0 && count ? count / 2 : Number.NaN
                  ),
                  backgroundColor: pattern.draw('diagonal', 'transparent', lineColor, 5),
                },
                {
                  // This null dataset produces the entry in the legend for the baseline annotation.
                  label: `Peak (${peak})`,
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
                  callbacks: {
                    ...callbacks,
                    label: (context) => {
                      return `${context.datasetIndex === 0 ? 'Actual:' : 'Scheduled:'} ${
                        context.parsed.y
                      } (${((100 * context.parsed.y) / peak).toFixed(1)}% of peak)`;
                    },
                  },
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
                      yMin: peak,
                      yMax: peak,
                      borderColor: CHART_COLORS.ANNOTATIONS,
                      // corresponds to null dataset index.
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
                    text: 'hours',
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
                  if (showTitle) drawSimpleTitle(`Daily Service Hours`, chart);
                },
              },
              Annotation,
              ChartjsPluginWatermark,
            ]}
          />
        </ChartDiv>
      </ChartBorder>
    );
  }, [
    data,
    line,
    isMobile,
    linePath,
    predictedData.counts,
    showTitle,
    callbacks,
    peak,
    startDate,
    endDate,
    unit,
    tooltipFormat,
  ]);
  return chart;
};
