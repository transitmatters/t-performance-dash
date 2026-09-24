import { Line } from 'react-chartjs-2';

import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import React, { useMemo, useRef } from 'react';
import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import type { DataPoint } from '../../types/dataPoints';
import { useAlertStore } from '../../../modules/tripexplorer/AlertStore';
import type { SingleDayLineProps } from '../../types/charts';
import { getAlertAnnotations } from '../../../modules/service/utils/graphUtils';
import { prettyDate } from '../../utils/date';
import { DownloadButton } from '../buttons/DownloadButton';
import { SaveChartImageButton } from '../buttons/SaveChartImageButton';
import { CopyLinkButton } from '../buttons/CopyLinkButton';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { watermarkLayout } from '../../constants/charts';
import { SEVERITY_COLORS, useChartTheme } from '../../utils/chartTheme';
import { getFormattedTimeString } from '../../utils/time';
import { AlertsDisclaimer } from '../general/AlertsDisclaimer';
import { FIVE_MINUTES } from '../../constants/time';
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
    // Check for null, undefined, NaN, or other invalid values
    if (
      benchmarkValue === null ||
      benchmarkValue === undefined ||
      typeof benchmarkValue !== 'number' ||
      !Number.isFinite(benchmarkValue)
    ) {
      return neutralColor;
    }
    const ratio = point[metric_field] / benchmarkValue;
    if (!Number.isFinite(ratio)) {
      return neutralColor;
    } else if (ratio <= 0.05 && showUnderRatio) {
      // Not actually 100% off, but we want to show it as an extreme
      return SEVERITY_COLORS.off100;
    } else if (ratio <= 0.5 && showUnderRatio) {
      return SEVERITY_COLORS.off50;
    } else if (ratio <= 0.75 && showUnderRatio) {
      return SEVERITY_COLORS.off25;
    } else if (ratio <= 1.25) {
      return SEVERITY_COLORS.onTime;
    } else if (ratio <= 1.5) {
      return SEVERITY_COLORS.off25;
    } else if (ratio <= 2.0) {
      return SEVERITY_COLORS.off50;
    } else if (ratio > 2.0) {
      return SEVERITY_COLORS.off100;
    }
    return neutralColor; // no benchmark to judge this point against
  });
};

const departureFromNormalString = (
  metric: number,
  benchmark: number,
  showUnderRatio?: boolean,
  referenceWord: 'schedule' | 'benchmark' = 'schedule'
) => {
  // Handle invalid benchmark values
  if (!benchmark || typeof benchmark !== 'number' || !Number.isFinite(benchmark)) {
    return '';
  }
  const ratio = metric / benchmark;
  if (showUnderRatio && ratio <= 0.5) {
    return `50%+ under ${referenceWord}`;
  } else if (showUnderRatio && ratio <= 0.75) {
    return `25%+ under ${referenceWord}`;
  } else if (!isFinite(ratio) || ratio <= 1.25) {
    return '';
  } else if (ratio <= 1.5) {
    return `25%+ over ${referenceWord}`;
  } else if (ratio <= 2.0) {
    return `50%+ over ${referenceWord}`;
  } else if (ratio > 2.0) {
    return `100%+ over ${referenceWord}`;
  }
  return '';
};

export const SingleDayLineChart: React.FC<SingleDayLineProps> = ({
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
}) => {
  const ref = useRef(null);
  const chartTheme = useChartTheme();
  const alerts = useAlertStore((store) => store.alerts)?.filter((alert) => alert.applied);
  const alertAnnotations = date && alerts ? getAlertAnnotations(alerts, date) : [];
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
            datasets: [
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
            ],
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
                  label: (tooltipItem) => {
                    const datasetLabel = tooltipItem.dataset.label ?? '';
                    const isBenchmark =
                      datasetLabel === 'MBTA Benchmark' ||
                      datasetLabel === 'TransitMatters Benchmark';
                    if (!tooltipItem.parsed.y || (tooltipItem.parsed.y === 0 && isBenchmark)) {
                      return '';
                    }
                    // Per-point label: a chart in "TM mode" can still have
                    // individual points that fell back to MBTA; name each
                    // point's benchmark source honestly.
                    const displayLabel = isBenchmark
                      ? tmBenchmarkData[tooltipItem.dataIndex] != null
                        ? 'TransitMatters Benchmark'
                        : 'MBTA Benchmark'
                      : datasetLabel;
                    return `${displayLabel}: ${
                      units === 'Minutes'
                        ? getFormattedTimeString(tooltipItem.parsed.y, 'minutes')
                        : `${tooltipItem.parsed.y} ${units}`
                    }`;
                  },
                  afterBody: (tooltipItems) => {
                    const result: string[] = [];

                    const benchmarkItem = tooltipItems.find(
                      (t) =>
                        t.dataset.label === 'MBTA Benchmark' ||
                        t.dataset.label === 'TransitMatters Benchmark'
                    );
                    const departureInfo = departureFromNormalString(
                      tooltipItems[0].parsed.y ?? 0,
                      benchmarkItem?.parsed.y ?? 0,
                      showUnderRatio,
                      usingTmBenchmark ? 'benchmark' : 'schedule'
                    );
                    if (departureInfo) {
                      result.push(departureInfo);
                    }

                    // Add vehicle consist information if available
                    const { dataIndex } = tooltipItems[0];
                    const dataPoint = data[dataIndex];
                    if (dataPoint?.vehicle_consist) {
                      const arrNums = dataPoint.vehicle_consist.split('|').map(Number);
                      if (arrNums.length > 1) {
                        result.push(
                          `Vehicle Numbers: ${dataPoint.vehicle_consist.replaceAll('|', ', ')}`
                        );
                      } else {
                        result.push(`Vehicle Number: ${dataPoint.vehicle_consist}`);
                      }
                    }
                    if (dataPoint?.vehicle_label) {
                      if (dataPoint?.vehicle_consist) {
                        const arrNums = dataPoint.vehicle_consist.split('|').map(Number);
                        const consistHead = arrNums[0];
                        if (consistHead === parseInt(dataPoint.vehicle_label)) {
                          //pass
                        } else {
                          result.push(`Vehicle Label: ${dataPoint.vehicle_label}`);
                        }
                      } else {
                        result.push(`Vehicle Label: ${dataPoint.vehicle_label}`);
                      }
                    }

                    return result;
                  },
                },
              },
              legend: {
                display: false,
              },
              annotation: {
                // Add your annotations here
                annotations: alertAnnotations,
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
