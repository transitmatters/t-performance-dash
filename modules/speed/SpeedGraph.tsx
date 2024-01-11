import React, { useRef } from 'react';
import { Line } from 'react-chartjs-2';

import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';

import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import { useDelimitatedRoute } from '../../common/utils/router';
import { CHART_COLORS, COLORS, LINE_COLORS } from '../../common/constants/colors';
import type { DataPoint, DeliveredTripMetrics } from '../../common/types/dataPoints';
import { drawSimpleTitle } from '../../common/components/charts/Title';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { watermarkLayout } from '../../common/constants/charts';
import { ChartBorder } from '../../common/components/charts/ChartBorder';
import { ChartDiv } from '../../common/components/charts/ChartDiv';
import { PEAK_SPEED } from '../../common/constants/baselines';
import { getShuttlingBlockAnnotations } from '../service/utils/graphUtils';
import { DownloadButton } from '../../common/components/buttons/DownloadButton';
import type { AggregateDataPoint } from '../../common/types/charts';
import type { ParamsType } from './constants/speeds';
import { addMPHToSpeedData } from './utils/utils';

interface SpeedGraphProps {
  data: DeliveredTripMetrics[];
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
  const peak = PEAK_SPEED[line ?? 'DEFAULT'];
  const ref = useRef();
  const isMobile = !useBreakpoint('md');
  const labels = data.map((point) => point.date);
  const shuttlingBlocks = getShuttlingBlockAnnotations(data);
  const dataWithMPH = addMPHToSpeedData(data);

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
                backgroundColor: COLORS.design.background,
                borderColor: LINE_COLORS[line ?? 'default'],
                pointRadius: 0,
                pointBorderWidth: 0,
                stepped: true,
                pointHoverRadius: 6,
                spanGaps: false,
                pointHoverBackgroundColor: LINE_COLORS[line ?? 'default'],
                pointBackgroundColor: LINE_COLORS[line ?? 'default'],
                data: data.map((datapoint) =>
                  (datapoint.miles_covered / (datapoint.total_time / 3600)).toFixed(1)
                ),
              },
              {
                // This null dataset produces the entry in the legend for the baseline annotation.
                label: `Historical Maximum (${peak} mph)`,
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
                    return `${context.parsed.y} (${((100 * context.parsed.y) / peak).toFixed(
                      1
                    )}% of historical maximum)`;
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
                    display: (ctx) => ctx.chart.isDatasetVisible(1),
                    borderWidth: 2,
                  },
                  ...shuttlingBlocks,
                ],
              },
            },
            scales: {
              y: {
                suggestedMin: 0,
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
                if (showTitle) drawSimpleTitle(`Speed`, chart);
              },
            },
            ChartjsPluginWatermark,
          ]}
        />
      </ChartDiv>
      <div className="flex flex-row items-end justify-end gap-4">
        {startDate && (
          <DownloadButton
            data={dataWithMPH as unknown as (DataPoint | AggregateDataPoint)[]}
            datasetName="speed"
            bothStops={false}
            startDate={startDate}
            endDate={endDate}
          />
        )}
      </div>
    </ChartBorder>
  );
};
