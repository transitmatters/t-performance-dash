import { useRef } from 'react';
import { Line } from '@chartjs-components';

import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';

import { round } from '@lodash-utils';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { LINE_COLORS } from '../../../common/constants/colors';
import type { FleetMetrics } from '../../../common/types/dataPoints';
import { drawSimpleTitle } from '../../../common/components/charts/Title';
import { HERO_LINE_WIDTH, useChartTheme } from '../../../common/utils/chartTheme';
import { hexWithAlpha } from '../../../common/utils/general';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import { ChartStack } from '../../../common/components/charts/ChartStack';
import { ChartActions } from '../../../common/components/charts/ChartActions';
import { ChartDiv } from '../../../common/components/charts/ChartDiv';
import {
  getNoDataSinceLatestAnnotation,
  getShuttlingBlockAnnotations,
} from '../../service/utils/graphUtils';
import {
  getMajorEventAnnotations,
  hideGapsExplainedByEvents,
  useMajorEvents,
} from '../../../common/utils/majorEvents';
import type { ParamsType } from '../../speed/constants/speeds';
import { explainGaps, usePageShutdowns } from '../../shutdowns';
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

export const FleetShareChart = ({
  data,
  metric,
  showShuttling,
  config,
  startDate,
  endDate,
  showTitle = false,
}: FleetShareChartProps) => {
  const { line, colorKey, linePath } = useDelimitatedRoute();
  const { tooltipFormat, unit, callbacks } = config;
  const ref = useRef(null);
  const chartTheme = useChartTheme();
  const isMobile = !useBreakpoint('md');
  const labels = data.map((point) => point.date);
  const lineColor = LINE_COLORS[colorKey ?? 'default'];
  // Keyed off the fleet metric, not miles_covered: a partial shutdown zeroes the line's
  // service metrics while cars still ran (and were sampled) on the remaining branches.
  // Checked against null rather than truthiness -- 0% is a real value.
  const shutdowns = usePageShutdowns('line', startDate, endDate);
  const events = useMajorEvents(line, startDate, endDate);
  const shuttlingBlocks = showShuttling
    ? hideGapsExplainedByEvents(
        explainGaps(
          getShuttlingBlockAnnotations(data, (datapoint) =>
            hasFleetMetric(datapoint, metric.field)
          ),
          shutdowns,
          { startDate, endDate, agg: config.agg }
        ),
        events
      )
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
                annotations: [
                  ...shuttlingBlocks,
                  ...getNoDataSinceLatestAnnotation(labels),
                  ...getMajorEventAnnotations(events),
                ],
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
          ]}
        />
      </ChartDiv>
      <ChartActions
        datasetName={metric.datasetName}
        chartRef={ref}
        csv={data}
        startDate={startDate}
        endDate={endDate}
      />
    </ChartStack>
  );
};
