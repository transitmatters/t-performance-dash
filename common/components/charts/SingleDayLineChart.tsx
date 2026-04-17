import { Line } from 'react-chartjs-2';

import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import React, { useMemo, useRef } from 'react';
import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import type { DataPoint } from '../../types/dataPoints';
import { CHART_COLORS, COLORS } from '../../constants/colors';
import { useAlertStore } from '../../../modules/tripexplorer/AlertStore';
import type { SingleDayLineProps } from '../../types/charts';
import { getAlertAnnotations } from '../../../modules/service/utils/graphUtils';
import { prettyDate } from '../../utils/date';
import { DownloadButton } from '../buttons/DownloadButton';
import { SaveChartImageButton } from '../buttons/SaveChartImageButton';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { watermarkLayout } from '../../constants/charts';
import { writeError } from '../../utils/chartError';
import { getFormattedTimeString } from '../../utils/time';
import { AlertsDisclaimer } from '../general/AlertsDisclaimer';
import { FIVE_MINUTES } from '../../constants/time';
import { LegendSingleDay } from './Legend';
import { ChartDiv } from './ChartDiv';
import { ChartBorder } from './ChartBorder';

const pointColors = (
  data: DataPoint[],
  metric_field: string,
  benchmark_field?: string,
  showUnderRatio?: boolean
) => {
  return data.map((point: DataPoint) => {
    if (benchmark_field) {
      const benchmarkValue = point[benchmark_field];
      // Check for null, undefined, NaN, or other invalid values
      if (
        benchmarkValue === null ||
        benchmarkValue === undefined ||
        typeof benchmarkValue !== 'number' ||
        !Number.isFinite(benchmarkValue)
      ) {
        return CHART_COLORS.GREY;
      }
      const ratio = point[metric_field] / benchmarkValue;
      if (!Number.isFinite(ratio)) {
        return CHART_COLORS.GREY;
      } else if (ratio <= 0.05 && showUnderRatio) {
        // Not actually 100% off, but we want to show it as an extreme
        return CHART_COLORS.PURPLE;
      } else if (ratio <= 0.5 && showUnderRatio) {
        return CHART_COLORS.RED;
      } else if (ratio <= 0.75 && showUnderRatio) {
        return CHART_COLORS.YELLOW;
      } else if (ratio <= 1.25) {
        return CHART_COLORS.GREEN;
      } else if (ratio <= 1.5) {
        return CHART_COLORS.YELLOW;
      } else if (ratio <= 2.0) {
        return CHART_COLORS.RED;
      } else if (ratio > 2.0) {
        return CHART_COLORS.PURPLE;
      }
    }

    return CHART_COLORS.GREY; //whatever
  });
};

const departureFromNormalString = (metric: number, benchmark: number, showUnderRatio?: boolean) => {
  // Handle invalid benchmark values
  if (!benchmark || typeof benchmark !== 'number' || !Number.isFinite(benchmark)) {
    return '';
  }
  const ratio = metric / benchmark;
  if (showUnderRatio && ratio <= 0.5) {
    return '50%+ under schedule';
  } else if (showUnderRatio && ratio <= 0.75) {
    return '25%+ under schedule';
  } else if (!isFinite(ratio) || ratio <= 1.25) {
    return '';
  } else if (ratio <= 1.5) {
    return '25%+ over schedule';
  } else if (ratio <= 2.0) {
    return '50%+ over schedule';
  } else if (ratio > 2.0) {
    return '100%+ over schedule';
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
  const ref = useRef();
  const alerts = useAlertStore((store) => store.alerts)?.filter((alert) => alert.applied);
  const alertAnnotations = date && alerts ? getAlertAnnotations(alerts, date) : [];
  const isMobile = !useBreakpoint('md');
  const labels = useMemo(() => data.map((item) => item[pointField]), [data, pointField]);

  // Format benchmark data if it exists.
  const benchmarkData = data.map((datapoint) => {
    const value = benchmarkField && datapoint[benchmarkField];
    // Handle NaN, null, undefined, and other falsy values
    if (!value || typeof value !== 'number' || !Number.isFinite(value)) {
      return null;
    }
    return value;
  });
  const displayBenchmarkData = benchmarkData.some((datapoint) => datapoint !== null);

  const multiplier = units === 'Minutes' ? 1 / 60 : 1;
  const benchmarkDataFormatted = benchmarkData
    .map((datapoint) => (datapoint ? (datapoint * multiplier).toFixed(2) : null))
    .filter((datapoint) => datapoint !== null);

  // TransitMatters benchmark: per-point min(tm_historic, mbta_benchmark). When
  // the MBTA wins, lines overlap (intentional — we can't ask for better than
  // what the T already schedules). When tm_historic is absent, show nothing
  // for that point so the line hides for non-rapid-transit routes.
  const tmBenchmarkData = data.map((datapoint, idx) => {
    const raw = tmBenchmarkField && datapoint[tmBenchmarkField];
    if (!raw || typeof raw !== 'number' || !Number.isFinite(raw)) {
      return null;
    }
    const mbta = benchmarkData[idx];
    const effective = typeof mbta === 'number' && Number.isFinite(mbta) ? Math.min(raw, mbta) : raw;
    return effective;
  });
  const displayTmBenchmarkData = tmBenchmarkData.some((d) => d !== null);
  const tmBenchmarkDataFormatted = tmBenchmarkData.map((d) =>
    d !== null ? (d * multiplier).toFixed(2) : null
  );

  // "Beat both" = actual beat BOTH the MBTA and the TM benchmark, when both
  // are available for the point. These points get a shiny pulsing ring to
  // celebrate trips that outperformed every benchmark we have.
  const beatBothMask = data.map((datapoint, idx) => {
    const actual = datapoint[metricField];
    const mbta = benchmarkData[idx];
    const tm = tmBenchmarkData[idx];
    if (typeof actual !== 'number' || !Number.isFinite(actual)) return false;
    if (typeof mbta !== 'number' || !Number.isFinite(mbta)) return false;
    if (typeof tm !== 'number' || !Number.isFinite(tm)) return false;
    return actual < mbta && actual < tm;
  });

  const convertedData = data.map((datapoint) =>
    ((datapoint[metricField] as number) * multiplier).toFixed(2)
  );

  return (
    <ChartBorder>
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
                borderColor: '#a0a0a030',
                pointBackgroundColor: pointColors(
                  data,
                  metricField,
                  benchmarkField,
                  showUnderRatio
                ),
                pointHoverRadius: 3,
                pointHoverBackgroundColor: pointColors(
                  data,
                  metricField,
                  benchmarkField,
                  showUnderRatio
                ),
                pointBorderColor: beatBothMask.map((beat) =>
                  beat ? 'rgba(16, 185, 129, 0.6)' : 'rgba(0,0,0,0.1)'
                ),
                pointBorderWidth: 1,
                pointRadius: 3,
                pointHitRadius: 10,
                data: convertedData,
              },
              {
                label: `MBTA Benchmark`,
                backgroundColor: '#a0a0a030',
                data: benchmarkDataFormatted,
                pointRadius: 0,
                pointHoverRadius: 3,
                fill: true,
                hidden: !displayBenchmarkData,
              },
              {
                label: `TransitMatters Benchmark`,
                borderColor: `${CHART_COLORS.RED}80`,
                borderDash: [6, 4],
                borderWidth: 2,
                data: tmBenchmarkDataFormatted,
                pointRadius: 0,
                pointHoverRadius: 3,
                fill: false,
                hidden: !displayTmBenchmarkData,
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
                    const isBenchmark =
                      tooltipItem.dataset.label === 'MBTA Benchmark' ||
                      tooltipItem.dataset.label === 'TransitMatters Benchmark';
                    if (!tooltipItem.parsed.y || (tooltipItem.parsed.y === 0 && isBenchmark)) {
                      return '';
                    }
                    return `${tooltipItem.dataset.label}: ${
                      units === 'Minutes'
                        ? getFormattedTimeString(tooltipItem.parsed.y, 'minutes')
                        : `${tooltipItem.parsed.y} ${units}`
                    }`;
                  },
                  afterBody: (tooltipItems) => {
                    const result: string[] = [];

                    // Departure from normal is measured against the MBTA benchmark.
                    const mbtaBenchmarkItem = tooltipItems.find(
                      (t) => t.dataset.label === 'MBTA Benchmark'
                    );
                    const departureInfo = departureFromNormalString(
                      tooltipItems[0].parsed.y ?? 0,
                      mbtaBenchmarkItem?.parsed.y ?? 0,
                      showUnderRatio
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
                ticks: {
                  color: COLORS.design.subtitleGrey,
                  callback: (value) => {
                    return units === 'Minutes' && typeof value === 'number'
                      ? getFormattedTimeString(value, 'minutes')
                      : value.toLocaleString();
                  },
                },
                title: {
                  display: true,
                  text: units,
                  color: COLORS.design.subtitleGrey,
                },
              },
              x: {
                type: 'time',
                time: {
                  unit: 'hour',
                  tooltipFormat: 'h:mm:ss a', // locale time with seconds
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
                  display: true,
                  text: date ? prettyDate(date, true) : 'No date selected',
                  color: COLORS.design.subtitleGrey,
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
          plugins={[
            {
              id: 'customTitle',
              afterDraw: (chart) => {
                if (date === undefined || date.length === 0 || data.length === 0) {
                  writeError(chart);
                }
              },
            },
            {
              // Pulsing gold ring around points that beat both benchmarks.
              // Self-schedules via requestAnimationFrame when there's anything
              // to animate, so idle charts pay no cost.
              id: 'shinyPoints',
              afterDatasetsDraw: (chart) => {
                const meta = chart.getDatasetMeta(0);
                if (!meta || !meta.data) return;
                const { ctx } = chart;
                // Cycle: ~1.6s pulse, ~2s rest. During the rest phase we skip
                // drawing entirely (no ring visible) but still tick so the
                // next pulse fires.
                const cycleMs = 3600;
                const pulseMs = 1600;
                const t = performance.now() % cycleMs;
                const inPulse = t < pulseMs;
                const pulse = inPulse ? Math.sin((t / pulseMs) * Math.PI) : 0;
                let anyShiny = false;
                if (inPulse) {
                  meta.data.forEach((point, idx) => {
                    if (!beatBothMask[idx]) return;
                    anyShiny = true;
                    const { x, y } = point as { x: number; y: number };
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(x, y, 4.5 + pulse * 2, 0, 2 * Math.PI);
                    ctx.strokeStyle = `rgba(16, 185, 129, ${pulse * 0.25})`;
                    ctx.lineWidth = 1.25;
                    ctx.stroke();
                    ctx.restore();
                  });
                } else {
                  anyShiny = beatBothMask.some(Boolean);
                }
                if (anyShiny) {
                  // During pulse: ~12fps redraw. During rest: wake up when the
                  // next pulse starts instead of ticking uselessly.
                  const delay = inPulse ? 80 : Math.max(cycleMs - t, 50);
                  setTimeout(() => {
                    if (chart.ctx) chart.draw();
                  }, delay);
                }
              },
            },
            ChartjsPluginWatermark,
          ]}
        />
      </ChartDiv>
      <div className="flex flex-col">
        {alerts && <AlertsDisclaimer alerts={alerts} />}
        <div className="flex flex-row items-end gap-4">
          {showLegend && benchmarkField ? (
            <LegendSingleDay
              showUnderRatio={showUnderRatio}
              showTmBenchmark={!!tmBenchmarkField && displayTmBenchmarkData}
            />
          ) : (
            <div className="w-full" />
          )}
          {date && (
            <>
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
            </>
          )}
        </div>
      </div>
    </ChartBorder>
  );
};
