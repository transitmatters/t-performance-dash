import { useMemo, useRef } from 'react';
import { Line } from '@chartjs-components';

import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import Annotation from 'chartjs-plugin-annotation';
import type { AnnotationOptions, AnnotationTypeRegistry } from 'chartjs-plugin-annotation';

import { useDelimitatedRoute } from '../../common/utils/router';
import { CHART_COLORS, COLORS, LINE_COLORS } from '../../common/constants/colors';
import type { RidershipCount } from '../../common/types/dataPoints';
import { drawSimpleTitle } from '../../common/components/charts/Title';
import { HERO_LINE_WIDTH } from '../../common/utils/chartTheme';
import { hexWithAlpha } from '../../common/utils/general';
import type { ParamsType } from '../speed/constants/speeds';
import {
  useRidershipBaseline,
  useSeasonalRidershipMaximums,
} from '../../common/api/hooks/baselines';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { ChartStack } from '../../common/components/charts/ChartStack';
import { ChartActions } from '../../common/components/charts/ChartActions';
import { ChartDiv } from '../../common/components/charts/ChartDiv';
import { getNoDataSinceLatestAnnotation } from '../service/utils/graphUtils';
import { getMajorEventAnnotations, useMajorEvents } from '../../common/utils/majorEvents';

interface RidershipGraphProps {
  data: RidershipCount[];
  config: ParamsType;
  startDate: string;
  endDate: string;
  showTitle?: boolean;
  serviceEnd?: string;
  serviceDateBlocks?: AnnotationOptions<keyof AnnotationTypeRegistry>[];
  /** Charts one station's ridership, which has no historical maximum to compare against */
  stationName?: string;
}

export const RidershipGraph = ({
  data,
  config,
  startDate,
  endDate,
  showTitle = false,
  serviceEnd,
  serviceDateBlocks = [],
  stationName,
}: RidershipGraphProps) => {
  const {
    line,
    colorKey,
    linePath,
    query: { busRoute, crRoute, ferryRoute },
  } = useDelimitatedRoute();
  const { tooltipFormat, unit, callbacks } = config;
  const isMobile = !useBreakpoint('md');
  const ref = useRef(null);
  const linePeak = useRidershipBaseline(line, busRoute, crRoute, ferryRoute);
  const peak = stationName ? 0 : linePeak;
  const seasonal = useSeasonalRidershipMaximums(line, busRoute, crRoute, ferryRoute);
  const seasonalMaximumFor = stationName ? undefined : seasonal.maximumFor;
  const seasonalPending = !stationName && seasonal.isPending;
  const events = useMajorEvents(line, startDate, endDate);

  const chart = useMemo(() => {
    const labels = data.map((point) => point.date);
    const lineColor = LINE_COLORS[colorKey ?? 'default'];
    // Each week against the most riders in the same week of past years, so December and holiday
    // weeks aren't measured against a fall peak (#938). Without it, the flat all-time maximum.
    const seasonalPeaks = seasonalMaximumFor
      ? data.map((point) => seasonalMaximumFor(point.date))
      : undefined;
    const showFlatPeak = !seasonalPeaks && !seasonalPending && peak > 0;

    return (
      <ChartStack>
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
                  label: stationName ? `Fare validations at ${stationName}` : `Fare validations`,
                  borderColor: lineColor,
                  borderWidth: HERO_LINE_WIDTH,
                  backgroundColor: hexWithAlpha(lineColor, 0.8),
                  pointRadius: 0,
                  pointBorderWidth: 0,
                  fill: true,
                  pointHoverRadius: 6,
                  pointHoverBackgroundColor: lineColor,
                  data: data.map((datapoint) => datapoint.count),
                },

                ...(seasonalPeaks
                  ? [
                      {
                        label: 'Historical maximum for the time of year',
                        borderColor: CHART_COLORS.ANNOTATIONS,
                        backgroundColor: CHART_COLORS.ANNOTATIONS,
                        borderWidth: 2,
                        borderDash: [6, 6],
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        pointBorderWidth: 0,
                        fill: false,
                        data: seasonalPeaks.map((max) => max?.value ?? null),
                      },
                    ]
                  : []),
                ...(showFlatPeak
                  ? [
                      {
                        // This null dataset produces the entry in the legend for the peak annotation.
                        label: `Historical Maximum (${peak.toLocaleString('en-us')} fare validations)`,
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
                    hoverCard: (items) => {
                      const item = items.find((item) => item.datasetIndex === 0);
                      const count = item?.parsed.y;
                      if (!item || !count) return null;
                      const seasonalPeak = seasonalPeaks?.[item.dataIndex];
                      const percentOf = (max: number) => ((100 * count) / max).toFixed(1);
                      return {
                        hero: {
                          value: count.toLocaleString('en-us'),
                          unit: 'fare validations',
                          color: lineColor,
                        },
                        meter: seasonalPeak
                          ? {
                              fraction: count / seasonalPeak.value,
                              label: `${percentOf(seasonalPeak.value)}% of the maximum for ${seasonalPeak.season} (${Math.round(seasonalPeak.value).toLocaleString('en-us')})`,
                              color: lineColor,
                            }
                          : showFlatPeak
                            ? {
                                fraction: count / peak,
                                label: `${percentOf(peak)}% of historical maximum (${peak.toLocaleString('en-us')})`,
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
                    ...(showFlatPeak
                      ? [
                          {
                            type: 'line' as const,
                            yMin: peak,
                            yMax: peak,
                            borderColor: CHART_COLORS.ANNOTATIONS,
                            // corresponds to null dataset index.
                            display: (ctx) => ctx.chart.isDatasetVisible(1),
                            borderWidth: 2,
                          },
                        ]
                      : []),
                    ...getNoDataSinceLatestAnnotation(
                      data.filter((point) => point.count !== null).map((point) => point.date),
                      serviceEnd
                    ),
                    ...serviceDateBlocks,
                    ...getMajorEventAnnotations(events),
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
            ]}
          />
        </ChartDiv>
        <ChartActions
          datasetName="ridership"
          chartRef={ref}
          csv={data}
          startDate={startDate}
          endDate={endDate}
        />
      </ChartStack>
    );
  }, [
    peak,
    seasonalMaximumFor,
    seasonalPending,
    stationName,
    colorKey,
    data,
    isMobile,
    linePath,
    showTitle,
    callbacks,
    startDate,
    endDate,
    events,
    unit,
    tooltipFormat,
    serviceEnd,
    serviceDateBlocks,
  ]);
  return chart;
};
