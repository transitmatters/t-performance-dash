import React, { useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import type { ChartTypeRegistry, TooltipCallbacks } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import pattern from 'patternomaly';
import type { AnnotationOptions } from 'chartjs-plugin-annotation';
import Annotation from 'chartjs-plugin-annotation';
import ChartjsPluginWatermark from 'chartjs-plugin-watermark';

import { useDelimitatedRoute } from '../../common/utils/router';
import { CHART_COLORS, COLORS, LINE_COLORS } from '../../common/constants/colors';
import { drawSimpleTitle } from '../../common/components/charts/Title';
import { hexWithAlpha } from '../../common/utils/general';
import type { ParamsType } from '../speed/constants/speeds';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { watermarkLayout } from '../../common/constants/charts';
import { ChartBorder } from '../../common/components/charts/ChartBorder';
import { ChartDiv } from '../../common/components/charts/ChartDiv';

type Dataset = {
  label: string;
  values: number[];
};

interface ScheduledAndDeliveredGraph {
  scheduled: Dataset;
  delivered: Dataset;
  annotations: AnnotationOptions[];
  tooltipLabel: TooltipCallbacks<keyof ChartTypeRegistry>['label'];
  title: string;
  yAxisLabel: string;
  config: ParamsType;
  startDate: string;
  endDate: string;
  labels: string[];
  peak: number;
  showTitle?: boolean;
}

export const ScheduledAndDeliveredGraph: React.FC<ScheduledAndDeliveredGraph> = ({
  scheduled,
  delivered,
  config,
  startDate,
  endDate,
  title,
  labels,
  yAxisLabel,
  tooltipLabel,
  peak,
  annotations = [],
  showTitle = false,
}) => {
  const { line, linePath } = useDelimitatedRoute();
  const { tooltipFormat, unit, callbacks } = config;

  const isMobile = !useBreakpoint('md');
  const ref = useRef();

  const chart = useMemo(() => {
    const lineColor = LINE_COLORS[line ?? 'default'];
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
                  label: delivered.label,
                  borderColor: lineColor,
                  backgroundColor: hexWithAlpha(lineColor, 0.8),
                  pointRadius: 0,
                  pointBorderWidth: 0,
                  stepped: true,
                  fill: true,
                  pointHoverRadius: 6,
                  pointHoverBackgroundColor: lineColor,
                  data: delivered.values,
                },
                {
                  label: scheduled.label,
                  stepped: true,
                  fill: true,
                  pointBorderWidth: 0,
                  pointRadius: 0,
                  pointHoverRadius: 6,

                  borderColor: lineColor,
                  spanGaps: false,
                  data: scheduled.values,
                  backgroundColor: pattern.draw('diagonal', 'transparent', lineColor, 5),
                },
                peak
                  ? {
                      // This null dataset produces the entry in the legend for the baseline annotation.
                      label: `Peak (${peak})`,
                      backgroundColor: CHART_COLORS.ANNOTATIONS,
                      data: null,
                    }
                  : null,
              ].filter((x) => x),
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
              // @ts-expect-error - The watermark plugin doesn't have typescript support
              watermark: watermarkLayout(isMobile),
              plugins: {
                tooltip: {
                  mode: 'index',
                  position: 'nearest',
                  callbacks: {
                    ...callbacks,
                    label: tooltipLabel,
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
                  annotations,
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
                    text: yAxisLabel,
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
                  if (!scheduled) {
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
                  if (showTitle) drawSimpleTitle(title, chart);
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
    annotations,
    callbacks,
    delivered,
    endDate,
    isMobile,
    labels,
    line,
    linePath,
    peak,
    scheduled,
    showTitle,
    startDate,
    title,
    tooltipFormat,
    tooltipLabel,
    unit,
    yAxisLabel,
  ]);
  return chart;
};
