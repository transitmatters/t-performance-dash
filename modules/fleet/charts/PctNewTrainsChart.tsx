import React, { useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { round } from 'lodash';

import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';

import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { COLORS, LINE_COLORS } from '../../../common/constants/colors';
import type { DeliveredTripMetrics } from '../../../common/types/dataPoints';
import { drawSimpleTitle } from '../../../common/components/charts/Title';
import { hexWithAlpha } from '../../../common/utils/general';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import { watermarkLayout } from '../../../common/constants/charts';
import { ChartBorder } from '../../../common/components/charts/ChartBorder';
import { ChartDiv } from '../../../common/components/charts/ChartDiv';
import type { ParamsType } from '../../speed/constants/speeds';

interface PctNewTrainsChartProps {
  data: DeliveredTripMetrics[];
  config: ParamsType;
  startDate: string;
  endDate: string;
  showTitle?: boolean;
}

export const PctNewTrainsChart: React.FC<PctNewTrainsChartProps> = ({
  data,
  config,
  startDate,
  endDate,
  showTitle = false,
}) => {
  const { line, linePath } = useDelimitatedRoute();
  const { tooltipFormat, unit, callbacks } = config;
  const ref = useRef();
  const isMobile = !useBreakpoint('md');
  const labels = data.map((point) => point.date);
  const lineColor = LINE_COLORS[line ?? 'default'];

  return (
    <ChartBorder>
      <ChartDiv isMobile={isMobile}>
        <Line
          id={`fleet-pct-new-${linePath}`}
          height={isMobile ? 240 : 200}
          ref={ref}
          redraw={true}
          data={{
            labels,
            datasets: [
              {
                label: '% of trips run by new trains',
                borderColor: lineColor,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointBorderWidth: 0,
                stepped: true,
                fill: true,
                pointHoverBackgroundColor: lineColor,
                backgroundColor: hexWithAlpha(lineColor, 0.8),
                data: data.map((datapoint) => datapoint.pct_new_trips ?? null),
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
                    if (context.parsed.y === null || context.parsed.y === undefined) return '';
                    return `${round(context.parsed.y, 1)}% new trains`;
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
            },
            scales: {
              y: {
                min: 0,
                max: 100,
                display: true,
                ticks: {
                  color: COLORS.design.subtitleGrey,
                  callback: (value) => `${value}%`,
                },
                title: {
                  display: true,
                  text: 'Trips run by new trains',
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
                if (showTitle) drawSimpleTitle(`% new trains`, chart);
              },
            },
            ChartjsPluginWatermark,
          ]}
        />
      </ChartDiv>
    </ChartBorder>
  );
};
