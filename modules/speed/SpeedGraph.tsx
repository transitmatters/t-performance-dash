import React, { useRef } from 'react';
import { Line } from 'react-chartjs-2';

import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';

import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import { useDelimitatedRoute } from '../../common/utils/router';
import { COLORS, LINE_COLORS } from '../../common/constants/colors';
import type { SpeedByLine, SpeedDataPoint } from '../../common/types/dataPoints';
import { drawSimpleTitle } from '../../common/components/charts/Title';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { watermarkLayout } from '../../common/constants/charts';
import { ChartBorder } from '../../common/components/charts/ChartBorder';
import { ChartDiv } from '../../common/components/charts/ChartDiv';
import { CORE_TRACK_LENGTHS, PEAK_MPH } from './constants/speeds';
import type { ParamsType } from './constants/speeds';

interface SpeedGraphProps {
  data: SpeedByLine[];
  config: ParamsType;
  startDate: string;
  endDate: string;
  showTitle?: boolean;
}

export const SpeedGraph: React.FC<SpeedGraphProps> = ({
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
                label: `MPH`,
                borderColor: LINE_COLORS[line ?? 'default'],
                pointRadius: 0,
                pointBorderWidth: 0,
                stepped: true,
                pointHoverRadius: 6,
                spanGaps: false,
                pointHoverBackgroundColor: LINE_COLORS[line ?? 'default'],
                data: data.map((datapoint) =>
                  (datapoint.miles_covered / (datapoint.total_time / 3600)).toFixed(1)
                ),
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
                suggestedMin: 0,
                suggestedMax: PEAK_MPH[line ?? 'DEFAULT'],
                display: true,
                ticks: {
                  color: COLORS.design.subtitleGrey,
                },
                title: {
                  display: true,
                  text: 'Miles per hour (mph)',
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
