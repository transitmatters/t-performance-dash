import { Line } from 'react-chartjs-2';

import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import React, { useMemo, useRef } from 'react';
import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import type { DataPoint } from '../../types/dataPoints';
import { CHART_COLORS, COLORS, LINE_COLORS } from '../../../common/constants/colors';
import type { SingleDayLineProps } from '../../../common/types/charts';
import { prettyDate } from '../../utils/date';
import { useDelimitatedRoute } from '../../utils/router';
import { DownloadButton } from '../buttons/DownloadButton';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { watermarkLayout } from '../../constants/charts';
import { writeError } from '../../utils/chartError';
import { getFormattedTimeString } from '../../utils/time';
import { Legend as LegendView } from './Legend';
import { ChartDiv } from './ChartDiv';
import { ChartBorder } from './ChartBorder';

const pointColors = (data: DataPoint[], metric_field: string, benchmark_field?: string) => {
  return data.map((point: DataPoint) => {
    if (benchmark_field) {
      const ratio = point[metric_field] / point[benchmark_field];
      if (point[benchmark_field] === null) {
        return CHART_COLORS.GREY; //grey
      } else if (ratio <= 1.25) {
        return CHART_COLORS.GREEN; //green
      } else if (ratio <= 1.5) {
        return CHART_COLORS.YELLOW; //yellow
      } else if (ratio <= 2.0) {
        return CHART_COLORS.RED; //red
      } else if (ratio > 2.0) {
        return CHART_COLORS.PURPLE; //purple
      }
    }

    return CHART_COLORS.GREY; //whatever
  });
};

const departureFromNormalString = (metric: number, benchmark: number) => {
  const ratio = metric / benchmark;
  if (!isFinite(ratio) || ratio <= 1.25) {
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
  bothStops = false,
  location,
  isHomescreen = false,
  showLegend = true,
}) => {
  const ref = useRef();
  const isMobile = !useBreakpoint('md');
  const labels = useMemo(() => data.map((item) => item[pointField]), [data, pointField]);
  const { line } = useDelimitatedRoute();
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
                pointBackgroundColor:
                  isHomescreen && line
                    ? LINE_COLORS[line]
                    : pointColors(data, metricField, benchmarkField),
                pointBorderWidth: isHomescreen ? 0 : undefined,
                pointHoverRadius: 3,
                pointHoverBackgroundColor:
                  isHomescreen && line
                    ? LINE_COLORS[line]
                    : pointColors(data, metricField, benchmarkField),
                pointRadius: 3,
                pointHitRadius: 10,
                data: data.map((datapoint) => ((datapoint[metricField] as number) / 60).toFixed(2)),
              },
              {
                label: `Benchmark MBTA`,
                backgroundColor: '#a0a0a030',
                data: benchmarkField
                  ? data.map((datapoint) => ((datapoint[benchmarkField] as number) / 60).toFixed(2))
                  : [],
                pointRadius: 0,
                pointHoverRadius: 3,
                fill: true,
                hidden: benchmarkField === undefined,
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
                      tooltipItem.parsed.y === 0 &&
                      tooltipItem.dataset.label === 'Benchmark MBTA'
                    ) {
                      return '';
                    }
                    return `${tooltipItem.dataset.label}: ${getFormattedTimeString(
                      tooltipItem.parsed.y,
                      'minutes'
                    )}`;
                  },
                  afterBody: (tooltipItems) => {
                    return departureFromNormalString(
                      tooltipItems[0].parsed.y,
                      tooltipItems[1]?.parsed.y
                    );
                  },
                },
              },
              legend: {
                display: false,
              },
            },
            scales: {
              y: {
                display: true,
                ticks: {
                  color: COLORS.design.subtitleGrey,
                },
                title: {
                  display: true,
                  text: 'Minutes',
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
                  axis.min = Math.min(axis.min, low.valueOf());
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
      <div className="flex flex-row items-end gap-4 pl-6 pr-2">
        {showLegend && benchmarkField ? <LegendView /> : <div className="w-full" />}
        {!isHomescreen && date && (
          <DownloadButton
            data={data}
            datasetName={fname}
            location={location}
            bothStops={bothStops}
            startDate={date}
          />
        )}
      </div>
    </ChartBorder>
  );
};
