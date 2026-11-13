import { Line } from '@chartjs-components';

import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import { useMemo, useRef, useState } from 'react';
import type { AggregateDataPoint, AggregateLineProps } from '../../types/charts';
import { prettyDate } from '../../utils/date';
import { CHART_COLORS } from '../../constants/colors';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useChartTheme } from '../../utils/chartTheme';
import { getFormattedTimeString } from '../../utils/time';
import {
  TEMPERATURE_BAND_OPACITY,
  TEMPERATURE_SCALE,
  alignDailyTemperatureSeries,
  dailyTemperatureOn,
  getDailyTemperatureSeries,
  temperatureColor,
  temperatureGradient,
  temperaturePointColor,
} from '../../../modules/weather/utils/temperatureDataset';
import { TripEmbedButton } from '../../../modules/tripexplorer/TripEmbedButton';
import { getMajorEventAnnotations, useMajorEvents } from '../../utils/majorEvents';
import { useDelimitatedRoute } from '../../utils/router';
import { LegendLongTerm } from './Legend';
import { ChartStack } from './ChartStack';
import { ChartActions } from './ChartActions';
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
  fill = false,
  embedChart,
  trendline = false,
}: AggregateLineProps) => {
  const ref = useRef(null);
  const chartTheme = useChartTheme();
  const hourly = timeUnit === 'hour';
  const {
    layers,
    annotations: weatherBlocks,
    temperatureEnabled: tempEnabled,
    geometryPlugin,
    weatherAt,
  } = useChartLayers({ startDate, endDate, granularity: 'daily', enabled: !hourly && !fill });
  const { weather } = layers;
  const temperatureSeries = useMemo(
    () => (!hourly && !fill && tempEnabled && weather ? getDailyTemperatureSeries(weather) : null),
    [hourly, fill, tempEnabled, weather]
  );
  const isMobile = !useBreakpoint('md');
  const labels = useMemo(() => data.map((item) => item[pointField]), [data, pointField]);
  const [isTrendlineVisible, setIsTrendlineVisible] = useState(trendline);
  const multiplier = yUnit === 'Minutes' ? 1 / 60 : 1;
  const { line } = useDelimitatedRoute();
  // Charts by time of day span many dates at every point, so there's no day to mark.
  const lineEvents = useMajorEvents(line, startDate, endDate);
  const events = hourly || byTime ? [] : lineEvents;

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
    const aligned = alignDailyTemperatureSeries(temperatureSeries, labels);
    const minIndex = datasets.length;
    datasets.push({
      label: 'Daily low',
      data: aligned.min,
      yAxisID: 'yTemp',
      borderColor: 'transparent',
      pointRadius: 0,
      pointHitRadius: 0,
      fill: false,
      tension: 0.3,
    });
    datasets.push({
      label: 'Daily high',
      data: aligned.max,
      yAxisID: 'yTemp',
      borderColor: 'transparent',
      backgroundColor: temperatureGradient(TEMPERATURE_BAND_OPACITY),
      pointRadius: 0,
      pointHitRadius: 0,
      fill: { target: minIndex },
      tension: 0.3,
    });
    datasets.push({
      label: 'Daily mean',
      data: aligned.mean,
      yAxisID: 'yTemp',
      borderColor: temperatureGradient(),
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 3,
      pointHoverBackgroundColor: temperaturePointColor,
      fill: false,
      tension: 0.3,
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
                display: !hourly && !fill && tempEnabled,
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
            plugins: {
              annotation: {
                annotations: [...weatherBlocks, ...getMajorEventAnnotations(events)],
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
                    const hoveredDay = medianItem?.parsed.x;
                    const weatherRow =
                      hoveredDay === undefined || hoveredDay === null
                        ? undefined
                        : weatherAt(hoveredDay);
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
                                color: temperatureColor(temperature.mean),
                              },
                            ]
                          : []),
                        ...(weatherRow ? [weatherRow] : []),
                      ],
                    };
                  },
                },
              },
            },
          }}
          plugins={[geometryPlugin]}
        />
      </ChartDiv>
      {!fill && <ContextTrack layers={layers} chartRef={ref} />}
      {!fill && (
        <div className="flex flex-col">
          <div className="flex flex-row flex-wrap items-end gap-x-4 gap-y-2">
            {showLegend && (
              <LegendLongTerm
                isTrendlineVisible={isTrendlineVisible}
                onToggleTrendline={() => setIsTrendlineVisible(!isTrendlineVisible)}
              />
            )}
            <ChartActions
              datasetName={fname}
              chartRef={ref}
              location={location}
              includeBothStopsForLocation={includeBothStopsForLocation}
              csv={data}
              startDate={startDate}
              endDate={endDate}
              chartTitle={chartTitle}
              embed={
                embedChart && (
                  <TripEmbedButton page="multi" chart={embedChart} trendline={isTrendlineVisible} />
                )
              }
              className="ml-auto shrink-0 whitespace-nowrap"
            />
          </div>
        </div>
      )}
    </ChartStack>
  );
};
