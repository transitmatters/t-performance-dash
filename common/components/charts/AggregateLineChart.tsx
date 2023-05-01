import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import React, { useMemo, useRef } from 'react';
import type { AggregateDataPoint, AggregateLineProps } from '../../types/charts';
import { prettyDate } from '../../utils/date';
import { CHART_COLORS } from '../../../common/constants/colors';
import { DownloadButton } from '../general/DownloadButton';
import { writeError } from '../../utils/chartError';
import { LegendLongTerm } from './Legend';
import { drawTitle } from './Title';

ChartJS.register(
  CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

const xAxisLabel = (startDate: string, endDate: string, hourly: boolean) => {
  if (hourly) {
    return `${prettyDate(startDate, false)} – ${prettyDate(endDate, false)}`;
  } else {
    const y1 = startDate.split('-')[0];
    const y2 = endDate.split('-')[0];
    return y1 === y2 ? y1 : `${y1} – ${y2}`;
  }
};

export const AggregateLineChart: React.FC<AggregateLineProps> = ({
  chartId,
  title,
  data,
  location,
  pointField,
  bothStops = false,
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
  isHomescreen = false,
}) => {
  const ref = useRef();
  const hourly = timeUnit === 'hour';
  const labels = useMemo(() => data.map((item) => item[pointField]), [data, pointField]);

  return (
    <div className="relative flex w-full flex-col pr-2">
      <div className="flex h-60 w-full flex-row">
        <Line
          id={chartId}
          ref={ref}
          height={240}
          redraw={true}
          data={{
            labels,
            datasets: [
              {
                label: seriesName,
                fill: false,
                tension: 0.1,
                pointBackgroundColor: CHART_COLORS.GREY,
                pointHoverRadius: 3,
                pointHoverBackgroundColor: CHART_COLORS.GREY,
                pointRadius: 3,
                pointHitRadius: 10,
                data: data.map((item: AggregateDataPoint) => (item['50%'] / 60).toFixed(2)),
              },
              {
                label: '25th percentile',
                fill: 1,
                backgroundColor: fillColor,
                tension: 0.4,
                pointRadius: 0,
                data: data.map((item: AggregateDataPoint) => (item['25%'] / 60).toFixed(2)),
              },
              {
                label: '75th percentile',
                fill: 1,
                backgroundColor: fillColor,
                tension: 0.4,
                pointRadius: 0,
                data: data.map((item: AggregateDataPoint) => (item['75%'] / 60).toFixed(2)),
              },
            ],
          }}
          options={{
            scales: {
              y: {
                title: {
                  display: true,
                  text: 'Minutes',
                },
                ticks: {
                  precision: 1,
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
                // @ts-expect-error The typing expectations are wrong
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
            layout: {
              padding: {
                top: 25,
              },
            },
            // Make the tooltip display all 3 datapoints for each x axis entry.
            interaction: {
              mode: 'index',
              intersect: false,
            },
            plugins: {
              legend: {
                display: false,
              },
              title: {
                // empty title to set font and leave room for drawTitle fn
                display: true,
                text: '',
              },
              tooltip: {
                mode: 'index',
                position: 'nearest',
                callbacks: {
                  label: (tooltipItem) => {
                    return `${tooltipItem.dataset.label}: ${tooltipItem.parsed.y} minutes`;
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
                drawTitle(title, location, bothStops, chart);
              },
            },
          ]}
        />
      </div>
      <div className="flex flex-row items-end gap-4 pl-6">
        {showLegend && <LegendLongTerm />}
        {!isHomescreen && startDate && (
          <DownloadButton
            data={data}
            datasetName={fname}
            location={location}
            bothStops={bothStops}
            startDate={startDate}
          />
        )}
      </div>
    </div>
  );
};
