import React, { useRef } from 'react';

import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import { Line } from 'react-chartjs-2';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { COLORS, LINE_COLORS } from '../../../common/constants/colors';
import type { DayDelayTotals } from '../../../common/types/dataPoints';
import type { LineShort, Line as TrainLine } from '../../../common/types/lines';
dayjs.extend(utc);
import { drawSimpleTitle } from '../../../common/components/charts/Title';
import { getTimeUnitSlowzones } from '../../../common/utils/slowZoneUtils';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import { watermarkLayout } from '../../../common/constants/charts';
import { ChartBorder } from '../../../common/components/charts/ChartBorder';
import { ChartDiv } from '../../../common/components/charts/ChartDiv';

interface TotalSlowTimeProps {
  // Data is always all data. We filter it by adjusting the X axis of the graph.
  data: DayDelayTotals[];
  startDateUTC: dayjs.Dayjs;
  endDateUTC: dayjs.Dayjs;
  lineShort?: LineShort;
  line?: TrainLine;
  showTitle: boolean;
}

export const TotalSlowTime: React.FC<TotalSlowTimeProps> = ({
  data,
  startDateUTC,
  endDateUTC,
  lineShort,
  line,
  showTitle,
}) => {
  const ref = useRef();
  const isMobile = !useBreakpoint('md');
  const labels = data.map((item) => dayjs.utc(item.date).format('YYYY-MM-DD'));
  const unit = getTimeUnitSlowzones(startDateUTC, endDateUTC);

  const datasets =
    line !== undefined && lineShort !== undefined
      ? [
          {
            label: `${lineShort} Line`,
            data: data?.map((d) => (d[lineShort] / 60).toFixed(2)),
            borderColor: LINE_COLORS[line],
            backgroundColor: LINE_COLORS[line],
            pointRadius: 0,
            tension: 0.1,
          },
        ]
      : [
          {
            label: `Red Line`,
            data: data?.map((d) => (d['Red'] / 60).toFixed(2)),
            borderColor: LINE_COLORS['line-red'],
            backgroundColor: LINE_COLORS['line-red'],
            pointRadius: 0,
            tension: 0.1,
          },
          {
            label: `Orange Line`,
            data: data?.map((d) => (d['Orange'] / 60).toFixed(2)),
            borderColor: LINE_COLORS['line-orange'],
            backgroundColor: LINE_COLORS['line-orange'],
            pointRadius: 0,
            tension: 0.1,
          },
          {
            label: `Blue Line`,
            data: data?.map((d) => (d['Blue'] / 60).toFixed(2)),
            borderColor: LINE_COLORS['line-blue'],
            backgroundColor: LINE_COLORS['line-blue'],
            pointRadius: 0,
            tension: 0.1,
          },
        ];
  return (
    <ChartBorder>
      <ChartDiv isMobile={isMobile}>
        <Line
          ref={ref}
          id={'total_slow_time'}
          height={isMobile ? 200 : 240}
          data={{
            labels,
            datasets: datasets,
          }}
          options={{
            maintainAspectRatio: false,
            elements: {
              point: {
                radius: 6,
                hitRadius: 6,
                hoverRadius: 6,
              },
            },
            responsive: true,
            layout: {
              padding: {
                top: showTitle ? 25 : 0,
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

                min: startDateUTC?.toISOString(),
                max: endDateUTC?.toISOString(),
                ticks: {
                  color: COLORS.design.subtitleGrey,
                },
                time: {
                  unit: unit,
                  displayFormats: {
                    month: 'MMM',
                  },
                },

                adapters: {
                  date: {
                    locale: enUS,
                  },
                },
                display: true,
              },
            },
            // @ts-expect-error The watermark plugin doesn't have typescript support
            watermark: watermarkLayout(isMobile),
            plugins: {
              tooltip: {
                intersect: false,
              },
              title: {
                // empty title to set font and leave room for drawTitle fn
                display: showTitle,
                text: '',
              },
              legend: {
                display: false,
              },
            },
          }}
          plugins={[
            {
              id: 'customTitle',
              afterDraw: (chart) => {
                if (showTitle) drawSimpleTitle(`Total Slow Time`, chart);
              },
            },
          ]}
        />
      </ChartDiv>
    </ChartBorder>
  );
};
