import React, { useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { round } from 'lodash';

import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';

import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { LINE_COLORS } from '../../../common/constants/colors';
import type { FleetMetrics } from '../../../common/types/dataPoints';
import { drawSimpleTitle } from '../../../common/components/charts/Title';
import { HERO_LINE_WIDTH, useChartTheme } from '../../../common/utils/chartTheme';
import { hexWithAlpha } from '../../../common/utils/general';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import { watermarkLayout } from '../../../common/constants/charts';
import { ChartStack } from '../../../common/components/charts/ChartStack';
import { ChartDiv } from '../../../common/components/charts/ChartDiv';
import { DownloadButton } from '../../../common/components/buttons/DownloadButton';
import { SaveChartImageButton } from '../../../common/components/buttons/SaveChartImageButton';
import { getShuttlingBlockAnnotations } from '../../service/utils/graphUtils';
import type { ParamsType } from '../../speed/constants/speeds';
import { hasFleetMetric, type FleetModeMetrics } from '../constants/fleetTypes';

interface FleetShareChartProps {
  data: FleetMetrics[];
  metric: NonNullable<FleetModeMetrics['share']>;
  showShuttling: boolean;
  config: ParamsType;
  startDate: string;
  endDate: string;
  showTitle?: boolean;
}

export const FleetShareChart: React.FC<FleetShareChartProps> = ({
  data,
  metric,
  showShuttling,
  config,
  startDate,
  endDate,
  showTitle = false,
}) => {
  const { line, linePath } = useDelimitatedRoute();
  const { tooltipFormat, unit, callbacks } = config;
  const ref = useRef(null);
  const chartTheme = useChartTheme();
  const isMobile = !useBreakpoint('md');
  const labels = data.map((point) => point.date);
  const lineColor = LINE_COLORS[line ?? 'default'];
  // Keyed off the fleet metric, not miles_covered: a partial shutdown zeroes the line's
  // service metrics while cars still ran (and were sampled) on the remaining branches.
  // Checked against null rather than truthiness -- 0% is a real value.
  const shuttlingBlocks = showShuttling
    ? getShuttlingBlockAnnotations(data, (datapoint) => hasFleetMetric(datapoint, metric.field))
    : [];

  return (
    <ChartStack>
      <ChartDiv isMobile={isMobile}>
        <Line
          id={`${metric.datasetName}-${linePath}`}
          height={isMobile ? 240 : 200}
          ref={ref}
          redraw={true}
          data={{
            labels,
            datasets: [
              {
                label: metric.title,
                fill: true,
                backgroundColor: hexWithAlpha(lineColor, 0.8),
                borderColor: lineColor,
                borderWidth: HERO_LINE_WIDTH,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointBorderWidth: 0,
                stepped: true,
                pointHoverBackgroundColor: lineColor,
                data: data.map((datapoint) => datapoint[metric.field] ?? null),
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
                    return `${round(context.parsed.y, 1)}% ${metric.tooltipSuffix}`;
                  },
                },
              },
              // A single series, already named by the card title.
              legend: {
                display: false,
              },
              title: {
                // empty title to set font and leave room for drawTitle fn
                display: showTitle,
                text: '',
              },
              annotation: {
                annotations: [...shuttlingBlocks],
              },
            },
            scales: {
              y: {
                min: 0,
                max: metric.fixedScale ? 100 : undefined,
                display: true,
                border: { display: false },
                grid: { color: chartTheme.grid },
                ticks: {
                  color: chartTheme.tick,
                  callback: (value) => `${value}%`,
                },
                title: {
                  display: true,
                  text: metric.axisLabel,
                  color: chartTheme.tick,
                },
              },
              x: {
                min: startDate,
                max: endDate,
                type: 'time',
                // Vertical rules add noise without helping readers compare values.
                grid: { display: false },
                border: { color: chartTheme.axisBorder },
                time: {
                  unit: unit,
                  tooltipFormat: tooltipFormat,
                  displayFormats: {
                    month: 'MMM',
                  },
                },
                ticks: {
                  color: chartTheme.tick,
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
                if (showTitle) drawSimpleTitle(metric.title, chart);
              },
            },
            ChartjsPluginWatermark,
          ]}
        />
      </ChartDiv>
      <div className="flex flex-row items-end justify-end gap-4">
        {startDate && (
          <>
            <SaveChartImageButton
              chartRef={ref}
              datasetName={metric.datasetName}
              includeBothStopsForLocation={false}
              startDate={startDate}
              endDate={endDate}
            />
            <DownloadButton
              data={data}
              datasetName={metric.datasetName}
              includeBothStopsForLocation={false}
              startDate={startDate}
              endDate={endDate}
            />
          </>
        )}
      </div>
    </ChartStack>
  );
};
