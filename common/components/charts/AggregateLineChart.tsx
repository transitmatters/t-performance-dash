import { Line } from 'react-chartjs-2';

import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import React, { useMemo, useRef, useState } from 'react';
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
import { LegendLongTerm } from './Legend';
import { ChartStack } from './ChartStack';
import { ChartDiv } from './ChartDiv';

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

export const AggregateLineChart: React.FC<AggregateLineProps> = ({
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
}) => {
  const ref = useRef();
  const chartTheme = useChartTheme();
  const hourly = timeUnit === 'hour';
  const isMobile = !useBreakpoint('md');
  const labels = useMemo(() => data.map((item) => item[pointField]), [data, pointField]);
  const [isTrendlineVisible, setIsTrendlineVisible] = useState(false);
  const multiplier = yUnit === 'Minutes' ? 1 / 60 : 1;

  const trendlineData = useMemo(() => {
    if (!isTrendlineVisible) return [];
    return calculateTrendline(data, pointField, multiplier);
  }, [data, pointField, multiplier, isTrendlineVisible]);

  const datasets = [
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
              legend: {
                display: false,
              },
              tooltip: {
                mode: 'index',
                position: 'nearest',
                callbacks: {
                  label: (tooltipItem) => {
                    if (!tooltipItem.parsed.y) return '';
                    return `${tooltipItem.dataset.label}: ${
                      yUnit === 'Minutes'
                        ? getFormattedTimeString(tooltipItem.parsed.y, 'minutes')
                        : `${tooltipItem.parsed.y} ${yUnit}`
                    }`;
                  },
                },
              },
            },
          }}
          plugins={[ChartjsPluginWatermark]}
        />
      </ChartDiv>
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
    </ChartStack>
  );
};
