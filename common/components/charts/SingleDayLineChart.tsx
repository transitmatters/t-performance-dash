import { Line } from '@chartjs-components';

import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import { useMemo, useRef } from 'react';
import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import type { DataPoint } from '../../types/dataPoints';
import { useAlertStore } from '../../../modules/tripexplorer/AlertStore';
import type { SingleDayLineProps } from '../../types/charts';
import { getAlertAnnotations } from '../../../modules/service/utils/graphUtils';
import { getWeatherAnnotations } from '../../../modules/weather/utils/weatherAnnotations';
import {
  TEMPERATURE_LINE_COLOR,
  getHourlyTemperatureSeries,
} from '../../../modules/weather/utils/temperatureDataset';
import { useWeatherData } from '../../api/hooks/weather';
import { useWeatherStore } from '../../../modules/weather/WeatherStore';
import { WeatherDisclaimer } from '../../../modules/weather/WeatherDisclaimer';
import { prettyDate } from '../../utils/date';
import { DownloadButton } from '../buttons/DownloadButton';
import { SaveChartImageButton } from '../buttons/SaveChartImageButton';
import { CopyLinkButton } from '../buttons/CopyLinkButton';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { watermarkLayout } from '../../constants/charts';
import {
  BUNCHED_RATIO,
  SEVERITY_COLORS,
  isOnTimeHeadwayRatio,
  severityForRatio,
  useChartTheme,
} from '../../utils/chartTheme';
import { CHART_COLORS } from '../../constants/colors';
import { getFormattedTimeString } from '../../utils/time';
import { AlertsDisclaimer } from '../general/AlertsDisclaimer';
import { FIVE_MINUTES } from '../../constants/time';
import type { HoverCardContent } from './hoverCard/types';
import { LegendSingleDay } from './Legend';
import { ChartDiv } from './ChartDiv';
import { ChartStack } from './ChartStack';

const pointColors = (
  data: DataPoint[],
  metric_field: string,
  neutralColor: string,
  effectiveBenchmark: (number | null)[],
  showUnderRatio?: boolean
) => {
  return data.map((point: DataPoint, idx: number) => {
    const benchmarkValue = effectiveBenchmark[idx];
    if (typeof benchmarkValue !== 'number' || !Number.isFinite(benchmarkValue)) {
      return neutralColor; // no benchmark to judge this point against
    }
    const severity = severityForRatio(point[metric_field] / benchmarkValue, showUnderRatio);
    return severity ? SEVERITY_COLORS[severity.tone] : neutralColor;
  });
};

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
}: SingleDayLineProps) => {
  const ref = useRef(null);
  const chartTheme = useChartTheme();
  const alerts = useAlertStore((store) => store.alerts)?.filter((alert) => alert.applied);
  const alertAnnotations = date && alerts ? getAlertAnnotations(alerts, date) : [];
  const weatherEnabled = useWeatherStore((s) => s.enabled);
  const tempEnabled = useWeatherStore((s) => s.temperatureEnabled);
  const { data: weather, isLoading: isWeatherLoading } = useWeatherData(
    { start_date: date, end_date: date },
    Boolean(date)
  );
  const weatherAnnotations = weatherEnabled
    ? getWeatherAnnotations(weather ?? [], { granularity: 'hourly' })
    : [];
  const temperaturePoints = useMemo(
    () => (tempEnabled && weather ? getHourlyTemperatureSeries(weather) : []),
    [tempEnabled, weather]
  );
  const isMobile = !useBreakpoint('md');
  const labels = useMemo(() => data.map((item) => item[pointField]), [data, pointField]);

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

  const datasets: Array<Record<string, unknown>> = [
    {
      label: `Actual`,
      fill: false,
      borderColor: chartTheme.benchmarkLine,
      pointBackgroundColor: pointColors(
        data,
        metricField,
        chartTheme.neutralPoint,
        effectiveBenchmarkData,
        showUnderRatio
      ),
      pointHoverRadius: 3,
      pointHoverBackgroundColor: pointColors(
        data,
        metricField,
        chartTheme.neutralPoint,
        effectiveBenchmarkData,
        showUnderRatio
      ),
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
      borderColor: TEMPERATURE_LINE_COLOR,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 3,
      pointHoverBackgroundColor: TEMPERATURE_LINE_COLOR,
      fill: false,
      tension: 0.3,
      spanGaps: true,
    });
  }

  return (
    <ChartStack>
      <ChartDiv isMobile={isMobile}>
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
            responsive: true,
            maintainAspectRatio: false,
            // @ts-expect-error The watermark plugin doesn't have typescript support
            watermark: watermarkLayout(isMobile),
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
                    const temperature = items.find(
                      (item) => (item.dataset as { yAxisID?: string }).yAxisID === 'yTemp'
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
                    if (temperature?.parsed.y) {
                      content.rows?.push({
                        label: 'Temperature',
                        value: `${temperature.parsed.y} °F`,
                        color: TEMPERATURE_LINE_COLOR,
                      });
                    }

                    const dataPoint = data[(actual ?? items[0]).dataIndex];
                    const consist = dataPoint?.vehicle_consist?.split('|') ?? [];
                    if (consist.length > 0) {
                      content.chips = {
                        label: consist.length > 1 ? 'Vehicles' : 'Vehicle',
                        values: consist,
                      };
                    }
                    // The label usually just repeats the lead car's number
                    const label = dataPoint?.vehicle_label;
                    if (label && Number(consist[0]) !== parseInt(label)) {
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
                annotations: [...alertAnnotations, ...weatherAnnotations],
              },
            },
            scales: {
              y: {
                display: true,
                border: { display: false },
                grid: { color: chartTheme.grid },
                ticks: {
                  color: chartTheme.tick,
                  callback: (value) => {
                    return units === 'Minutes' && typeof value === 'number'
                      ? getFormattedTimeString(value, 'minutes')
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
                  text: date ? prettyDate(date, true) : 'No date selected',
                  color: chartTheme.tick,
                },
                afterDataLimits: (axis) => {
                  const today = new Date(`${date}T00:00:00`);
                  const low = new Date(today);
                  low.setHours(6);
                  axis.min = Math.min(axis.min - FIVE_MINUTES, low.valueOf());
                  const high = new Date(today);
                  high.setDate(high.getDate() + 1);
                  high.setHours(1);
                  high.setMinutes(15);
                  axis.max = Math.max(axis.max, high.valueOf());
                },
              },
            },
          }}
          plugins={[ChartjsPluginWatermark]}
        />
      </ChartDiv>
      <div className="flex flex-col">
        {alerts && <AlertsDisclaimer alerts={alerts} />}
        {date && <WeatherDisclaimer hours={weather} isLoading={isWeatherLoading} />}
        <div className="flex flex-row flex-wrap items-end justify-between gap-x-6 gap-y-2">
          {showLegend && benchmarkField ? (
            <LegendSingleDay showUnderRatio={showUnderRatio} usingTmBenchmark={usingTmBenchmark} />
          ) : (
            <div className="w-full" />
          )}
          {date && (
            <div className="-mr-2.5 ml-auto flex shrink-0 flex-row items-center gap-x-0.5 whitespace-nowrap">
              <CopyLinkButton />
              <SaveChartImageButton
                chartRef={ref}
                datasetName={fname}
                location={location}
                includeBothStopsForLocation={includeBothStopsForLocation}
                startDate={date}
                chartTitle={chartTitle}
              />
              <DownloadButton
                data={data}
                datasetName={fname}
                location={location}
                includeBothStopsForLocation={includeBothStopsForLocation}
                startDate={date}
              />
            </div>
          )}
        </div>
      </div>
    </ChartStack>
  );
};
