import { Line } from 'react-chartjs-2';
import type { Chart as ChartJS } from 'chart.js';

import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import React, { useMemo, useRef, useState } from 'react';
import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import type { AggregateDataPoint, AggregateLineProps } from '../../types/charts';
import { prettyDate } from '../../utils/date';
import { CHART_COLORS } from '../../constants/colors';
import { DownloadButton } from '../buttons/DownloadButton';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { watermarkLayout } from '../../constants/charts';
import { writeError } from '../../utils/chartError';
import { getFormattedTimeString } from '../../utils/time';
import { LegendLongTerm } from './Legend';
import { ChartBorder } from './ChartBorder';
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
}) => {
  const ref = useRef();
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
      borderColor: byTime ? CHART_COLORS.DARK_LINE : undefined,
      pointBackgroundColor: CHART_COLORS.GREY,
      pointHoverRadius: 3,
      pointHoverBackgroundColor: CHART_COLORS.GREY,
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
    <ChartBorder>
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
                title: {
                  display: true,
                  text: yUnit,
                },
                ticks: {
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
          plugins={[
            {
              id: 'customTitleAggregate',
              afterDraw: (chart: ChartJS) => {
                if (startDate === undefined || endDate === undefined || data.length === 0) {
                  writeError(chart);
                }
              },
            },
            ChartjsPluginWatermark,
          ]}
        />
      </ChartDiv>
      <div className="flex flex-row items-end gap-4">
        {showLegend && (
          <LegendLongTerm
            isTrendlineVisible={isTrendlineVisible}
            onToggleTrendline={() => setIsTrendlineVisible(!isTrendlineVisible)}
          />
        )}
        {startDate && (
          <DownloadButton
            data={data}
            datasetName={fname}
            location={location}
            includeBothStopsForLocation={includeBothStopsForLocation}
            startDate={startDate}
          />
        )}
      </div>
    </ChartBorder>
  );
};
