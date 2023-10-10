import React, { useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';

import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import Annotation from 'chartjs-plugin-annotation';
import ChartjsPluginWatermark from 'chartjs-plugin-watermark';

import { useDelimitatedRoute } from '../../common/utils/router';
import { CHART_COLORS, COLORS, LINE_COLORS } from '../../common/constants/colors';
import type { RidershipCount } from '../../common/types/dataPoints';
import { drawSimpleTitle } from '../../common/components/charts/Title';
import { hexWithAlpha } from '../../common/utils/general';
import type { ParamsType } from '../speed/constants/speeds';
import { PEAK_RIDERSHIP } from '../../common/constants/baselines';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { watermarkLayout } from '../../common/constants/charts';
import { ChartBorder } from '../../common/components/charts/ChartBorder';
import { ChartDiv } from '../../common/components/charts/ChartDiv';

interface RidershipGraphProps {
  data: RidershipCount[];
  config: ParamsType;
  startDate: string;
  endDate: string;
  showTitle?: boolean;
}

export const RidershipGraph: React.FC<RidershipGraphProps> = ({
  data,
  config,
  startDate,
  endDate,
  showTitle = false,
}) => {
  const {
    line,
    linePath,
    query: { busRoute },
  } = useDelimitatedRoute();
  const { tooltipFormat, unit, callbacks } = config;
  const isMobile = !useBreakpoint('md');
  const ref = useRef();

  const chart = useMemo(() => {
    const routeIndex = busRoute ? busRoute.replaceAll('/', '') : line;
    const labels = data.map((point) => point.date);
    const lineColor = LINE_COLORS[line ?? 'default'];
    return (
      <ChartBorder>
        <ChartDiv isMobile={isMobile}>
          <Line
            id={`ridership-${linePath}`}
            height={isMobile ? 200 : 240}
            ref={ref}
            redraw={true}
            data={{
              labels,
              datasets: [
                {
                  label: `Fare validations`,
                  borderColor: lineColor,
                  backgroundColor: hexWithAlpha(lineColor, 0.8),
                  pointRadius: 0,
                  pointBorderWidth: 0,
                  fill: true,
                  pointHoverRadius: 6,
                  pointHoverBackgroundColor: lineColor,
                  data: data.map((datapoint) => datapoint.count),
                },

                {
                  // This null dataset produces the entry in the legend for the peak annotation.
                  label: `Historical Maximum (${PEAK_RIDERSHIP[
                    routeIndex ?? 'DEFAULT'
                  ].toLocaleString('en-us')} fare validations)`,
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
                      return `${context.parsed.y.toLocaleString('en-us')} (${(
                        (100 * context.parsed.y) /
                        PEAK_RIDERSHIP[routeIndex ?? 'DEFAULT']
                      ).toFixed(1)}% of historical maximum)`;
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
                      yMin: PEAK_RIDERSHIP[routeIndex ?? 'DEFAULT'],
                      yMax: PEAK_RIDERSHIP[routeIndex ?? 'DEFAULT'],
                      borderColor: CHART_COLORS.ANNOTATIONS,
                      // corresponds to null dataset index.
                      display: (ctx) => ctx.chart.isDatasetVisible(1),
                      borderWidth: 2,
                    },
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
                    text: 'Fare validations',
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
              ChartjsPluginWatermark,
            ]}
          />
        </ChartDiv>
      </ChartBorder>
    );
  }, [
    busRoute,
    line,
    data,
    isMobile,
    linePath,
    showTitle,
    callbacks,
    startDate,
    endDate,
    unit,
    tooltipFormat,
  ]);
  return chart;
};
