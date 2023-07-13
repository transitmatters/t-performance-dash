import React, { useRef } from 'react';
import { round } from 'lodash';
import { Line } from 'react-chartjs-2';

import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';

import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import { useDelimitatedRoute } from '../../common/utils/router';
import { COLORS, LINE_COLORS } from '../../common/constants/colors';
import type { DeliveredTripMetrics } from '../../common/types/dataPoints';
import { drawSimpleTitle } from '../../common/components/charts/Title';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { watermarkLayout } from '../../common/constants/charts';
import { ChartBorder } from '../../common/components/charts/ChartBorder';
import { ChartDiv } from '../../common/components/charts/ChartDiv';
import { PEAK_MPH } from '../../common/constants/baselines';
import { getShuttlingBlockAnnotations } from '../service/utils/graphUtils';
import type { ParamsType } from './constants/speeds';

interface TripTimeIncreaseChartProps {
  data: DeliveredTripMetrics[];
  config: ParamsType;
  startDate: string;
  endDate: string;
  showTitle?: boolean;
}

export const DelaysChart: React.FC<TripTimeIncreaseChartProps> = ({
  data,
  config,
  startDate,
  endDate,
  showTitle = false,
}) => {
  const { line, linePath } = useDelimitatedRoute();
  const { tooltipFormat, unit, callbacks } = config;
  const peak = PEAK_MPH[line ?? 'DEFAULT'];
  const ref = useRef();
  const isMobile = !useBreakpoint('md');
  const labels = data.map((point) => point.date);
  const shuttlingBlocks = getShuttlingBlockAnnotations(data);

  return (
    <ChartBorder>
      <ChartDiv isMobile={isMobile}>
        <Line
          id={`speed-${linePath}`}
          height={isMobile ? 240 : 200}
          ref={ref}
          redraw={true}
          data={{
            labels,
            datasets: [
              {
                label: `Delay`,
                borderColor: LINE_COLORS[line ?? 'default'],
                pointRadius: 0,
                pointBorderWidth: 0,
                stepped: true,
                pointHoverRadius: 6,
                spanGaps: false,
                pointHoverBackgroundColor: LINE_COLORS[line ?? 'default'],
                pointBackgroundColor: LINE_COLORS[line ?? 'default'],
                data: data.map((datapoint) => {
                  const mph = round(datapoint.miles_covered / (datapoint.total_time / 3600), 1);
                  return (100 * ((PEAK_MPH[line ?? 'DEFAULT'] - mph) / mph)).toFixed(1);
                }),
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
                    return `Trips are ${context.parsed.y}% ${
                      context.parsed.y >= 0 ? 'longer' : 'shorter'
                    } than peak`;
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
                annotations: [...shuttlingBlocks],
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
                  text: '% delay',
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
                if (showTitle) drawSimpleTitle(`Median Speed`, chart);
              },
            },
            ChartjsPluginWatermark,
          ]}
        />
      </ChartDiv>
    </ChartBorder>
  );
};
