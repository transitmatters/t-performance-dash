import { useRef } from 'react';
import { Line } from '@chartjs-components';

import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';

import { useLinePage } from '../../../common/hooks/usePageParams';
import { CHART_COLORS, COLORS } from '../../../common/constants/colors';
import { HERO_LINE_WIDTH } from '../../../common/utils/chartTheme';
import { hexWithAlpha } from '../../../common/utils/general';
import type { SpeedTripMetrics } from '../../../common/types/dataPoints';
import { drawSimpleTitle } from '../../../common/components/charts/Title';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import { ChartStack } from '../../../common/components/charts/ChartStack';
import { ChartActions } from '../../../common/components/charts/ChartActions';
import { ChartDiv } from '../../../common/components/charts/ChartDiv';
import { useSpeedBaseline } from '../../../common/api/hooks/baselines';
import {
  getNoDataSinceLatestAnnotation,
  getShuttlingBlockAnnotations,
} from '../../service/utils/graphUtils';
import {
  getMajorEventAnnotations,
  hideGapsExplainedByEvents,
  useMajorEvents,
} from '../../../common/utils/majorEvents';
import { addMPHToSpeedData } from '../../../common/utils/csv';
import type { ParamsType } from '../constants/speeds';
import { explainGaps, useOtherLineShutdowns, usePageShutdowns } from '../../shutdowns';

interface SpeedGraphProps {
  data: SpeedTripMetrics[];
  config: ParamsType;
  startDate: string;
  endDate: string;
  showTitle?: boolean;
  peakLineDashed?: boolean;
}

export const SpeedGraph = ({
  data,
  config,
  startDate,
  endDate,
  showTitle = false,
  peakLineDashed = false,
}: SpeedGraphProps) => {
  const { line, color: lineColor, linePath, lineShort } = useLinePage();
  const { tooltipFormat, unit, callbacks } = config;
  const peak = useSpeedBaseline(line);
  const ref = useRef(null);
  const isMobile = !useBreakpoint('md');
  const labels = data.map((point) => point.date);
  const shutdowns = usePageShutdowns('line', startDate, endDate);
  const events = useMajorEvents(line, startDate, endDate);
  const otherShutdowns = useOtherLineShutdowns(lineShort, startDate, endDate);
  const shuttlingBlocks = hideGapsExplainedByEvents(
    explainGaps(getShuttlingBlockAnnotations(data), shutdowns, {
      startDate,
      endDate,
      agg: config.agg,
    }),
    events
  );
  const dataWithMPH = addMPHToSpeedData(data);

  return (
    <ChartStack>
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
                fill: true,
                backgroundColor: hexWithAlpha(lineColor, 0.8),
                borderColor: lineColor,
                borderWidth: HERO_LINE_WIDTH,
                pointRadius: 0,
                pointBorderWidth: 0,
                stepped: true,
                pointHoverRadius: 6,
                spanGaps: false,
                pointHoverBackgroundColor: lineColor,
                pointBackgroundColor: lineColor,
                // Days with no trips are left out rather than plotted as 0 mph under the gap's band
                data: data.map((datapoint) =>
                  datapoint.miles_covered
                    ? (datapoint.miles_covered / (datapoint.total_time / 3600)).toFixed(1)
                    : null
                ),
              },
              // Lines without a speed baseline (bus) get no legend entry for it.
              ...(peak
                ? [
                    {
                      label: `Historical Maximum (${peak} mph)`,
                      backgroundColor: CHART_COLORS.ANNOTATIONS,
                      data: null,
                    },
                  ]
                : []),
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            layout: {
              padding: {
                top: showTitle ? 25 : 0,
                // Room for the wordmark under the legend: its desktop height (watermarkSize) plus a gap.
                bottom: 21,
              },
            },
            interaction: {
              intersect: false,
            },
            plugins: {
              // Below the legend: the filled speed line often reaches the plot's top corner.
              watermark: { placement: 'below' },
              tooltip: {
                mode: 'index',
                position: 'nearest',
                callbacks: {
                  ...callbacks,
                  hoverCard: (items) => {
                    const mph = items.find((item) => item.datasetIndex === 0)?.parsed.y;
                    if (!mph) return null;
                    return {
                      hero: { value: `${mph}`, unit: 'mph', color: lineColor },
                      meter: peak
                        ? {
                            fraction: mph / peak,
                            label: `${((100 * mph) / peak).toFixed(1)}% of historical maximum (${peak} mph)`,
                            color: lineColor,
                          }
                        : undefined,
                    };
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
                  // Kept in lockstep with the dataset above: index 1 is only the peak
                  // dataset when there is a peak.
                  ...(peak
                    ? [
                        {
                          type: 'line' as const,
                          yMin: peak,
                          yMax: peak,
                          borderColor: CHART_COLORS.ANNOTATIONS,
                          // corresponds to null dataset index.
                          display: (ctx: {
                            chart: { isDatasetVisible: (index: number) => boolean };
                          }) => ctx.chart.isDatasetVisible(1),
                          borderWidth: 2,
                          borderDash: peakLineDashed ? [6, 6] : undefined,
                        },
                      ]
                    : []),
                  ...shuttlingBlocks,
                  ...getNoDataSinceLatestAnnotation(labels),
                  ...getMajorEventAnnotations(events),
                  ...otherShutdowns.annotations,
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
          ]}
        />
      </ChartDiv>
      <ChartActions
        datasetName="speed"
        chartRef={ref}
        csv={dataWithMPH}
        startDate={startDate}
        endDate={endDate}
      />
    </ChartStack>
  );
};
