import { Line } from '@chartjs-components';

import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import { useMemo, useRef, useState } from 'react';
import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import type { AggregateDataPoint, AggregateLineProps } from '../../types/charts';
import { prettyDate } from '../../utils/date';
import { CHART_COLORS } from '../../constants/colors';
import { DownloadButton } from '../buttons/DownloadButton';
import { SaveChartImageButton } from '../buttons/SaveChartImageButton';
import { CopyLinkButton } from '../buttons/CopyLinkButton';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { watermarkLayout } from '../../constants/charts';
import { useChartTheme } from '../../utils/chartTheme';
import { getFormattedTimeString } from '../../utils/time';
import {
  TEMPERATURE_BAND_COLOR,
  TEMPERATURE_LINE_COLOR,
  TEMPERATURE_SCALE,
  dailyTemperatureOn,
  getDailyTemperatureSeries,
} from '../../../modules/weather/utils/temperatureDataset';
import { LegendLongTerm } from './Legend';
import { ChartStack } from './ChartStack';
import { ChartDiv } from './ChartDiv';
import { ContextTrack } from './contextTrack/ContextTrack';
import { useChartLayers } from './contextTrack/useChartLayers';

const xAxisLabel = (startDate: string, endDate: string, hourly: boolean) => {
  if (hourly) {
    return `${prettyDate(startDate, false)} – ${prettyDate(endDate, false)}`;
  } else {
    const y1 = startDate.split('-')[0];
    const y2 = endDate.split('-')[0];
    return y1 === y2 ? y1 : `${y1} – ${y2}`;
  }
};

const calculateTrendline = (data: AggregateDataPoint[], pointField: string, multiplier: number) => {
  if (data.length < 2) return [];

  const xValues = data.map((item) => new Date(item[pointField]).getTime());
  const yValues = data.map((item) => Number(item['50%']) * multiplier);

  const xMean = xValues.reduce((a, b) => a + b, 0) / xValues.length;
  const yMean = yValues.reduce((a, b) => a + b, 0) / yValues.length;

  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < xValues.length; i++) {
    numerator += (xValues[i] - xMean) * (yValues[i] - yMean);
    denominator += Math.pow(xValues[i] - xMean, 2);
  }
  const slope = numerator / denominator;
  const intercept = yMean - slope * xMean;

  // Calculate trendline value for each point
  return data.map((item) => {
    const x = new Date(item[pointField]).getTime();
    return {
      x: item[pointField],
      y: Number((slope * x + intercept).toFixed(2)),
    };
  });
};

export const AggregateLineChart = ({
  chartId,
  data,
  location,
  pointField,
  includeBothStopsForLocation = false,
  fname,
  timeUnit,
  timeFormat,
  seriesName,
  startDate,
  endDate,
  fillColor,
  suggestedYMin,
  suggestedYMax,
  showLegend = true,
  byTime = false,
  yUnit = 'Minutes',
  chartTitle,
  hoverRows,
}: AggregateLineProps) => {
  const ref = useRef(null);
  const chartTheme = useChartTheme();
  const hourly = timeUnit === 'hour';
  const {
    layers,
    annotations: weatherBlocks,
    temperatureEnabled: tempEnabled,
    geometryPlugin,
  } = useChartLayers({ startDate, endDate, granularity: 'daily', enabled: !hourly });
  const { weather } = layers;
  const temperatureSeries = useMemo(
    () => (!hourly && tempEnabled && weather ? getDailyTemperatureSeries(weather) : null),
    [hourly, tempEnabled, weather]
  );
  const isMobile = !useBreakpoint('md');
  const labels = useMemo(() => data.map((item) => item[pointField]), [data, pointField]);
  const [isTrendlineVisible, setIsTrendlineVisible] = useState(false);
  const multiplier = yUnit === 'Minutes' ? 1 / 60 : 1;

  const trendlineData = useMemo(() => {
    if (!isTrendlineVisible) return [];
    return calculateTrendline(data, pointField, multiplier);
  }, [data, pointField, multiplier, isTrendlineVisible]);

  const datasets: Array<Record<string, unknown>> = [
    {
      label: 'Trend',
      fill: false,
      borderColor: CHART_COLORS.RED,
      borderWidth: 2,
      pointRadius: 0,
      tension: 0,
      data: trendlineData,
    },
    {
      label: seriesName,
      fill: false,
      tension: 0.1,
      borderColor: byTime ? chartTheme.medianLine : undefined,
      pointBackgroundColor: chartTheme.neutralPoint,
      pointHoverRadius: 3,
      pointHoverBackgroundColor: chartTheme.neutralPoint,
      pointRadius: byTime ? 0 : 3,
      pointHitRadius: 10,
      stepped: byTime,
      data: data.map((item: AggregateDataPoint) => (item['50%'] * multiplier).toFixed(2)),
    },
    {
      label: '25th percentile',
      fill: 1,
      backgroundColor: fillColor,
      stepped: byTime,
      tension: 0.4,
      pointRadius: 0,
      data: data.map((item: AggregateDataPoint) => (item['25%'] * multiplier).toFixed(2)),
    },
    {
      label: '75th percentile',
      fill: 1,
      backgroundColor: fillColor,
      stepped: byTime,
      tension: 0.4,
      pointRadius: 0,
      data: data.map((item: AggregateDataPoint) => (item['75%'] * multiplier).toFixed(2)),
    },
  ];

  if (temperatureSeries && temperatureSeries.mean.length > 0) {
    const minIndex = datasets.length;
    datasets.push({
      label: 'Daily low',
      data: temperatureSeries.min,
      yAxisID: 'yTemp',
      borderColor: 'transparent',
      pointRadius: 0,
      pointHitRadius: 0,
      fill: false,
      tension: 0.3,
    });
    datasets.push({
      label: 'Daily high',
      data: temperatureSeries.max,
      yAxisID: 'yTemp',
      borderColor: 'transparent',
      backgroundColor: TEMPERATURE_BAND_COLOR,
      pointRadius: 0,
      pointHitRadius: 0,
      fill: { target: minIndex },
      tension: 0.3,
    });
    datasets.push({
      label: 'Daily mean',
      data: temperatureSeries.mean,
      yAxisID: 'yTemp',
      borderColor: TEMPERATURE_LINE_COLOR,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 3,
      pointHoverBackgroundColor: TEMPERATURE_LINE_COLOR,
      fill: false,
      tension: 0.3,
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
            // @ts-expect-error it doesnt like our combo of x,y in trendline + x and y seperate in datasets
            datasets,
          }}
          options={{
            scales: {
              y: {
                grid: { color: chartTheme.grid },
                border: { display: false },
                title: {
                  display: true,
                  text: yUnit,
                  color: chartTheme.tick,
                },
                ticks: {
                  color: chartTheme.tick,
                  precision: 1,
                  callback: (value) => {
                    return yUnit === 'Minutes' && typeof value === 'number'
                      ? getFormattedTimeString(value, 'minutes')
                      : value.toLocaleString();
                  },
                },
                suggestedMin: suggestedYMin,
                suggestedMax: suggestedYMax,
              },
              yTemp: {
                type: 'linear',
                position: 'right',
                display: !hourly && tempEnabled,
                suggestedMin: TEMPERATURE_SCALE.min,
                suggestedMax: TEMPERATURE_SCALE.max,
                title: {
                  display: true,
                  text: '°F',
                },
                grid: {
                  drawOnChartArea: false,
                },
              },
              x: {
                grid: { display: false },
                border: { color: chartTheme.axisBorder },
                ticks: { color: chartTheme.tick },
                time: {
                  unit: timeUnit,
                  // @ts-expect-error The typing expectations are wrong
                  stepSize: 1,
                  tooltipFormat: timeFormat,
                },
                type: 'time',
                adapters: {
                  date: {
                    locale: enUS,
                  },
                },
                // force graph to show startDate to endDate, even if missing data
                min: hourly ? undefined : startDate,
                max: hourly ? undefined : endDate,
                title: {
                  display: true,
                  text: xAxisLabel(startDate ?? '', endDate ?? '', hourly),
                  color: chartTheme.tick,
                },
              },
            },
            responsive: true,
            maintainAspectRatio: false,
            // Make the tooltip display all 3 datapoints for each x axis entry.
            interaction: {
              mode: 'index',
              intersect: false,
            },
            watermark: watermarkLayout(isMobile),
            plugins: {
              annotation: {
                annotations: weatherBlocks,
              },
              legend: {
                display: false,
              },
              tooltip: {
                mode: 'index',
                position: 'nearest',
                callbacks: {
                  hoverCard: (items) => {
                    const valueOf = (label: string) =>
                      items.find((item) => item.dataset.label === label)?.parsed.y || undefined;
                    const format = (value: number) =>
                      yUnit === 'Minutes'
                        ? getFormattedTimeString(value, 'minutes')
                        : `${Number(value.toFixed(1))} ${yUnit}`;
                    const median = valueOf(seriesName);
                    const p25 = valueOf('25th percentile');
                    const p75 = valueOf('75th percentile');
                    const trend = valueOf('Trend');
                    const medianItem = items.find((item) => item.dataset.label === seriesName);
                    // Read by date, as the weather days don't always line up with the data's
                    const temperature =
                      temperatureSeries && medianItem
                        ? dailyTemperatureOn(
                            temperatureSeries,
                            String(labels[medianItem.dataIndex]).slice(0, 10)
                          )
                        : undefined;
                    const extraRows =
                      hoverRows && medianItem ? hoverRows(data[medianItem.dataIndex]) : [];

                    return {
                      hero: median
                        ? {
                            value: format(median),
                            caption: seriesName,
                            color: chartTheme.neutralPoint,
                          }
                        : undefined,
                      rows: [
                        ...(p75
                          ? [{ label: '75th percentile', value: format(p75), color: fillColor }]
                          : []),
                        ...(p25
                          ? [{ label: '25th percentile', value: format(p25), color: fillColor }]
                          : []),
                        ...extraRows,
                        ...(trend
                          ? [{ label: 'Trend', value: format(trend), color: CHART_COLORS.RED }]
                          : []),
                        ...(temperature
                          ? [
                              {
                                label: 'Outdoor temperature',
                                value: `${Math.round(temperature.mean)} °F`,
                                detail: `${Math.round(temperature.low)}–${Math.round(temperature.high)} °F`,
                                color: TEMPERATURE_LINE_COLOR,
                              },
                            ]
                          : []),
                      ],
                    };
                  },
                },
              },
            },
          }}
          plugins={[ChartjsPluginWatermark, geometryPlugin]}
        />
      </ChartDiv>
      <ContextTrack layers={layers} chartRef={ref} />
      <div className="flex flex-col">
        <div className="flex flex-row flex-wrap items-end gap-x-4 gap-y-2">
          {showLegend && (
            <LegendLongTerm
              isTrendlineVisible={isTrendlineVisible}
              onToggleTrendline={() => setIsTrendlineVisible(!isTrendlineVisible)}
            />
          )}
          {startDate && (
            <div className="-mr-2.5 ml-auto flex shrink-0 flex-row items-center gap-x-0.5 whitespace-nowrap">
              <CopyLinkButton />
              <SaveChartImageButton
                chartRef={ref}
                datasetName={fname}
                location={location}
                includeBothStopsForLocation={includeBothStopsForLocation}
                startDate={startDate}
                endDate={endDate}
                chartTitle={chartTitle}
              />
              <DownloadButton
                data={data}
                datasetName={fname}
                location={location}
                includeBothStopsForLocation={includeBothStopsForLocation}
                startDate={startDate}
              />
            </div>
          )}
        </div>
      </div>
    </ChartStack>
  );
};
