import { Line } from '@chartjs-components';

import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import { useMemo, useRef } from 'react';
import type { DataPoint } from '../../types/dataPoints';
import type { SingleDayLineProps } from '../../types/charts';
import {
  TEMPERATURE_SCALE,
  getHourlyTemperatureSeries,
  temperatureAt,
  temperatureColor,
  temperatureGradient,
} from '../../../modules/weather/utils/temperatureDataset';
import { prettyDate } from '../../utils/date';
import { TripEmbedButton } from '../../../modules/tripexplorer/TripEmbedButton';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import {
  BUNCHED_RATIO,
  SEVERITY_COLORS,
  isOnTimeHeadwayRatio,
  severityForRatio,
  severityPointStyle,
  useChartTheme,
} from '../../utils/chartTheme';
import { CHART_COLORS } from '../../constants/colors';
import { formatMinutesTick, getFormattedTimeString } from '../../utils/time';
import { consistHoverContent } from '../../utils/occupancy';
import type { HoverCardContent } from './hoverCard/types';
import { LegendSingleDay } from './Legend';
import { ChartDiv } from './ChartDiv';
import { ChartStack } from './ChartStack';
import { ChartActions } from './ChartActions';
import { ContextTrack } from './contextTrack/ContextTrack';
import { useChartLayers } from './contextTrack/useChartLayers';
import { singleDayAxisBounds } from './contextTrack/segments';
import { useIntroAnimation } from './introAnimation';

/** Each point's severity against its benchmark, or undefined with no benchmark to judge it by. */
const pointTones = (
  data: DataPoint[],
  metric_field: string,
  effectiveBenchmark: (number | null)[],
  showUnderRatio?: boolean
) =>
  data.map((point: DataPoint, idx: number) => {
    const benchmarkValue = effectiveBenchmark[idx];
    if (typeof benchmarkValue !== 'number' || !Number.isFinite(benchmarkValue)) return undefined;
    return severityForRatio(point[metric_field] / benchmarkValue, showUnderRatio)?.tone;
  });

export const SingleDayLineChart = ({
  chartId,
  data,
  date,
  metricField,
  pointField,
  benchmarkField,
  tmBenchmarkField,
  fname,
  includeBothStopsForLocation = false,
  location,
  units,
  showLegend = true,
  showUnderRatio = false,
  chartTitle,
  fill = false,
  embedChart,
  callout,
  actions = true,
  intro = false,
  alerts,
}: SingleDayLineProps) => {
  const ref = useRef(null);
  const { pending: introPending, options: introOptions } = useIntroAnimation(intro, data.length);
  const chartTheme = useChartTheme();
  const {
    layers,
    annotations: layerAnnotations,
    temperatureEnabled: tempEnabled,
    geometryPlugin,
    weatherAt,
  } = useChartLayers({
    startDate: date,
    endDate: date,
    granularity: 'hourly',
    // Embeds have no track, so they skip the request
    enabled: !fill,
    alerts,
  });
  const { weather } = layers;
  const temperaturePoints = useMemo(
    () => (tempEnabled && weather ? getHourlyTemperatureSeries(weather) : []),
    [tempEnabled, weather]
  );
  const isMobile = !useBreakpoint('md');
  const labels = useMemo(() => data.map((item) => item[pointField]), [data, pointField]);
  const xBounds = useMemo(() => singleDayAxisBounds(date, labels), [date, labels]);

  // Per-point MBTA scheduled benchmark.
  const mbtaBenchmarkData = data.map((datapoint) => {
    const value = benchmarkField && datapoint[benchmarkField];
    if (!value || typeof value !== 'number' || !Number.isFinite(value)) {
      return null;
    }
    return value;
  });

  // Per-point TM historical benchmark (already capped at the MBTA value by the
  // backend generator, so we never go *above* the MBTA number).
  const tmBenchmarkData = data.map((datapoint) => {
    const raw = tmBenchmarkField && datapoint[tmBenchmarkField];
    if (!raw || typeof raw !== 'number' || !Number.isFinite(raw)) {
      return null;
    }
    return raw;
  });

  // Effective benchmark = TM when available, else MBTA. This is what the
  // chart band *and* the dot colors are compared against. When TM is absent
  // (bus, CR, missing pair) we transparently fall back to the MBTA value.
  const effectiveBenchmarkData = data.map(
    (_, idx) => tmBenchmarkData[idx] ?? mbtaBenchmarkData[idx]
  );
  const displayBenchmarkData = effectiveBenchmarkData.some((d) => d !== null);
  const usingTmBenchmark = tmBenchmarkData.some((d) => d !== null);

  const multiplier = units === 'Minutes' ? 1 / 60 : 1;
  // Keep nulls in place so Chart.js renders gaps at those points rather than
  // compressing the array and misaligning the benchmark line against labels.
  const effectiveBenchmarkFormatted = effectiveBenchmarkData.map((d) =>
    d !== null ? (d * multiplier).toFixed(2) : null
  );

  const convertedData = data.map((datapoint) =>
    ((datapoint[metricField] as number) * multiplier).toFixed(2)
  );

  const tones = pointTones(data, metricField, effectiveBenchmarkData, showUnderRatio);
  const pointColors = tones.map((tone) => (tone ? SEVERITY_COLORS[tone] : chartTheme.neutralPoint));

  // Ringed and labeled beside the point, on whichever side has room, so it stays inside the plot
  // Held back while an intro draws the series in, then shown once the last point lands.
  const calloutValue = callout && !introPending ? Number(convertedData[callout.index]) : NaN;
  // Annotations are clipped to the plot, so the ring and label need room above the point when it's
  // the day's highest. 15% leaves at least 14px on a phone, more than half the label's height. Set
  // before the callout shows, so the axis doesn't jump when it appears.
  const calloutHeadroom = callout ? Number(convertedData[callout.index]) * 1.15 : undefined;
  const calloutAnnotations: typeof layerAnnotations =
    callout && Number.isFinite(calloutValue)
      ? [
          {
            type: 'point',
            xValue: labels[callout.index] as string,
            yValue: calloutValue,
            radius: 8,
            backgroundColor: 'transparent',
            borderColor: chartTheme.medianLine,
            borderWidth: 2,
          },
          {
            type: 'label',
            xValue: labels[callout.index] as string,
            yValue: calloutValue,
            content: callout.label,
            position: { x: callout.index / data.length > 0.6 ? 'end' : 'start', y: 'center' },
            xAdjust: callout.index / data.length > 0.6 ? -14 : 14,
            color: chartTheme.calloutText,
            backgroundColor: chartTheme.medianLine,
            borderRadius: 6,
            padding: { x: 8, y: 4 },
            font: { size: 12, weight: 600 },
          },
        ]
      : [];

  const datasets: Array<Record<string, unknown>> = [
    {
      label: `Actual`,
      fill: false,
      borderColor: chartTheme.benchmarkLine,
      pointBackgroundColor: pointColors,
      pointHoverRadius: 3,
      pointHoverBackgroundColor: pointColors,
      pointStyle: tones.map(severityPointStyle),
      pointRadius: 3,
      pointHitRadius: 10,
      data: convertedData,
    },
    {
      // Dataset label switches based on whether any point on this
      // chart uses the TM value. The tooltip overrides this per
      // point to get the exact name right for each hover.
      label: usingTmBenchmark ? `TransitMatters Benchmark` : `MBTA Benchmark`,
      backgroundColor: chartTheme.benchmarkFill,
      data: effectiveBenchmarkFormatted,
      pointRadius: 0,
      pointHoverRadius: 3,
      fill: true,
      hidden: !displayBenchmarkData,
    },
  ];

  if (temperaturePoints.length > 0) {
    datasets.push({
      label: 'Temperature',
      data: temperaturePoints,
      yAxisID: 'yTemp',
      borderColor: temperatureGradient(),
      borderWidth: 2,
      pointRadius: 0,
      // Hovering matches trips by index, which would light up an unrelated hour
      pointHoverRadius: 0,
      fill: false,
      tension: 0.3,
      spanGaps: true,
    });
  }

  return (
    <ChartStack className={fill ? 'h-full' : undefined}>
      <ChartDiv isMobile={isMobile} fill={fill}>
        <Line
          id={chartId}
          ref={ref}
          height={isMobile ? 200 : 240}
          redraw={true}
          data={{
            labels,
            // @ts-expect-error mixed data shapes (string[] and {x,y}[]) in one chart
            datasets,
          }}
          options={{
            ...introOptions,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              tooltip: {
                mode: 'index',
                position: 'nearest',
                callbacks: {
                  hoverCard: (items) => {
                    const actual = items.find((item) => item.dataset.label === 'Actual');
                    const benchmark = items.find(
                      (item) =>
                        item.dataset.label === 'MBTA Benchmark' ||
                        item.dataset.label === 'TransitMatters Benchmark'
                    );
                    const format = (value: number) =>
                      units === 'Minutes'
                        ? getFormattedTimeString(value, 'minutes')
                        : `${Number(value.toFixed(1))} ${units}`;
                    const content: HoverCardContent = { rows: [] };

                    const actualValue = actual?.parsed.y;
                    const benchmarkValue = benchmark?.parsed.y;
                    const severity =
                      actualValue && benchmarkValue
                        ? severityForRatio(actualValue / benchmarkValue, showUnderRatio)
                        : null;
                    if (actualValue) {
                      content.hero = {
                        value: format(actualValue),
                        caption: 'Actual',
                        color: severity ? SEVERITY_COLORS[severity.tone] : chartTheme.neutralPoint,
                      };
                    }
                    if (benchmark && benchmarkValue) {
                      // A chart in "TM mode" can still have points that fell back to MBTA, so
                      // name each point's benchmark source honestly.
                      const referenceWord = usingTmBenchmark ? 'benchmark' : 'schedule';
                      content.rows?.push({
                        label:
                          tmBenchmarkData[benchmark.dataIndex] != null
                            ? 'TransitMatters Benchmark'
                            : 'MBTA Benchmark',
                        value: format(benchmarkValue),
                        color: CHART_COLORS.ANNOTATIONS,
                      });
                      if (actualValue && severity) {
                        const delta = actualValue - benchmarkValue;
                        const deltaText = `${delta < 0 ? '−' : '+'}${format(Math.abs(delta))}`;
                        // Headway dots name the stat they count toward under the chart
                        const ratio = actualValue / benchmarkValue;
                        const headwayStatus = !showUnderRatio
                          ? null
                          : ratio <= BUNCHED_RATIO
                            ? 'Bunched'
                            : isOnTimeHeadwayRatio(ratio)
                              ? 'On time'
                              : null;
                        content.badge = {
                          tone: severity.tone,
                          text: headwayStatus
                            ? `${headwayStatus} · ${deltaText} vs ${referenceWord}`
                            : severity.label
                              ? `${deltaText} · ${severity.label} ${referenceWord}`
                              : `${deltaText} vs ${referenceWord}`,
                        };
                      }
                    } else if (showUnderRatio && actualValue) {
                      content.notes = [
                        'No scheduled headway, but still counted in the Bunched and On time totals',
                      ];
                    }
                    // Read by time, as the hourly readings don't line up with the trips
                    const hoveredTime = (actual ?? items[0]).parsed.x;
                    const temperature =
                      hoveredTime === null
                        ? undefined
                        : temperatureAt(temperaturePoints, hoveredTime);
                    if (temperature !== undefined) {
                      content.rows?.push({
                        label: 'Outdoor temperature',
                        value: `${Math.round(temperature)} °F`,
                        color: temperatureColor(temperature),
                      });
                    }
                    const weatherRow = hoveredTime === null ? undefined : weatherAt(hoveredTime);
                    if (weatherRow) content.rows?.push(weatherRow);

                    const dataPoint = data[(actual ?? items[0]).dataIndex];
                    const { train, chips, load } = consistHoverContent(dataPoint);
                    if (load) content.rows?.push(load);
                    content.train = train;
                    content.chips = chips;
                    // The label usually just repeats the lead car's number
                    const label = dataPoint?.vehicle_label;
                    const leadCar = dataPoint?.vehicle_consist?.split('|')[0];
                    if (label && Number(leadCar) !== parseInt(label)) {
                      content.notes = [...(content.notes ?? []), `Vehicle label: ${label}`];
                    }
                    return content;
                  },
                },
              },
              legend: {
                display: false,
              },
              annotation: {
                // Add your annotations here
                annotations: [...layerAnnotations, ...calloutAnnotations],
              },
            },
            scales: {
              y: {
                display: true,
                suggestedMax: calloutHeadroom,
                border: { display: false },
                grid: { color: chartTheme.grid },
                ticks: {
                  color: chartTheme.tick,
                  callback: (value) => {
                    return units === 'Minutes' && typeof value === 'number'
                      ? formatMinutesTick(value)
                      : value.toLocaleString();
                  },
                },
                title: {
                  display: true,
                  text: units,
                  color: chartTheme.tick,
                },
              },
              yTemp: {
                type: 'linear',
                position: 'right',
                display: tempEnabled,
                suggestedMin: TEMPERATURE_SCALE.min,
                suggestedMax: TEMPERATURE_SCALE.max,
                title: {
                  display: true,
                  text: '°F',
                  color: chartTheme.tick,
                },
                grid: {
                  drawOnChartArea: false,
                },
              },
              x: {
                type: 'time',
                // Vertical rules add noise without helping readers compare values.
                grid: { display: false },
                border: { color: chartTheme.axisBorder },
                time: {
                  unit: 'hour',
                  tooltipFormat: 'h:mm:ss a', // locale time with seconds
                  displayFormats: { hour: 'h a' },
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
                  display: true,
                  text: prettyDate(date, true),
                  color: chartTheme.tick,
                },
                min: xBounds.min,
                max: xBounds.max,
              },
            },
          }}
          plugins={[geometryPlugin]}
        />
      </ChartDiv>
      <ContextTrack layers={layers} chartRef={ref} />
      <div className="flex flex-col">
        <div className="flex flex-row flex-wrap items-end justify-between gap-x-6 gap-y-2">
          {showLegend && benchmarkField ? (
            <LegendSingleDay showUnderRatio={showUnderRatio} usingTmBenchmark={usingTmBenchmark} />
          ) : (
            <div className="w-full" />
          )}
          {actions && (
            <ChartActions
              datasetName={fname}
              chartRef={ref}
              location={location}
              includeBothStopsForLocation={includeBothStopsForLocation}
              csv={data}
              startDate={date}
              chartTitle={chartTitle}
              embed={embedChart && <TripEmbedButton page="single" chart={embedChart} />}
              className="ml-auto shrink-0 whitespace-nowrap"
            />
          )}
        </div>
      </div>
    </ChartStack>
  );
};
