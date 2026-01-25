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
  fname,
  includeBothStopsForLocation = false,
  location,
  units,
  showLegend = true,
  showUnderRatio = false,
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
                pointRadius: 3,
                pointHitRadius: 10,
                data: convertedData,
              },
              {
                label: `Benchmark MBTA`,
                backgroundColor: '#a0a0a030',
                data: benchmarkDataFormatted,
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
                    if (
                      !tooltipItem.parsed.y ||
                      (tooltipItem.parsed.y === 0 && tooltipItem.dataset.label === 'Benchmark MBTA')
                    ) {
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

                    // Add departure from normal information
                    const departureInfo = departureFromNormalString(
                      tooltipItems[0].parsed.y ?? 0,
                      tooltipItems[1]?.parsed.y ?? 0,
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
            ChartjsPluginWatermark,
          ]}
        />
      </ChartDiv>
      <div className="flex flex-col">
        {alerts && <AlertsDisclaimer alerts={alerts} />}
        <div className="flex flex-row items-end gap-4">
          {showLegend && benchmarkField ? (
            <LegendSingleDay showUnderRatio={showUnderRatio} />
          ) : (
            <div className="w-full" />
          )}
          {date && (
            <DownloadButton
              data={data}
              datasetName={fname}
              location={location}
              includeBothStopsForLocation={includeBothStopsForLocation}
              startDate={date}
            />
          )}
        </div>
      </div>
    </ChartBorder>
  );
};
