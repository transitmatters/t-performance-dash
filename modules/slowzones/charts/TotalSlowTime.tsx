import React, { useRef } from 'react';

import 'chartjs-adapter-date-fns';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import duration from 'dayjs/plugin/duration';
import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import { Line } from '@chartjs-components';
import { useTranslation } from 'react-i18next';
import { LINE_OBJECTS } from '../../../common/constants/lines';
import { getDateFnsLocale } from '../../../common/i18n/format';
import { COLORS, LINE_COLORS } from '../../../common/constants/colors';
import type { DayDelayTotals } from '../../../common/types/dataPoints';
import type { LineShort, Line as TrainLine } from '../../../common/types/lines';
import { drawSimpleTitle } from '../../../common/components/charts/Title';
import { getTimeUnitSlowzones } from '../../../common/utils/slowZoneUtils';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import { watermarkLayout } from '../../../common/constants/charts';
import { ChartStack } from '../../../common/components/charts/ChartStack';
import { ChartDiv } from '../../../common/components/charts/ChartDiv';
import { getFormattedTimeString } from '../../../common/utils/time';

dayjs.extend(utc);
dayjs.extend(duration);

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
  const { t } = useTranslation(['slowzones', 'common']);
  const ref = useRef(null);
  const isMobile = !useBreakpoint('md');
  const labels = data.map((item) => dayjs.utc(item.date).format('YYYY-MM-DD'));
  const unit = getTimeUnitSlowzones(startDateUTC, endDateUTC);
  const isLinePage = line !== undefined && lineShort !== undefined;

  const datasets = isLinePage
    ? [
        {
          label: LINE_OBJECTS[line].name,
          data: data?.map((d) => (d[lineShort] / 60).toFixed(2)),
          borderColor: LINE_COLORS[line],
          backgroundColor: LINE_COLORS[line],
          pointRadius: 0,
          tension: 0.1,
        },
      ]
    : [
        {
          label: LINE_OBJECTS['line-red'].name,
          data: data?.map((d) => (d['Red'] / 60).toFixed(2)),
          borderColor: LINE_COLORS['line-red'],
          backgroundColor: LINE_COLORS['line-red'],
          pointRadius: 0,
          tension: 0.1,
        },
        {
          label: LINE_OBJECTS['line-orange'].name,
          data: data?.map((d) => (d['Orange'] / 60).toFixed(2)),
          borderColor: LINE_COLORS['line-orange'],
          backgroundColor: LINE_COLORS['line-orange'],
          pointRadius: 0,
          tension: 0.1,
        },
        {
          label: LINE_OBJECTS['line-blue'].name,
          data: data?.map((d) => (d['Blue'] / 60).toFixed(2)),
          borderColor: LINE_COLORS['line-blue'],
          backgroundColor: LINE_COLORS['line-blue'],
          pointRadius: 0,
          tension: 0.1,
        },
        {
          label: LINE_OBJECTS['line-green'].name,
          data: data?.map((d) => (d['Green'] / 60).toFixed(2)),
          borderColor: LINE_COLORS['line-green'],
          backgroundColor: LINE_COLORS['line-green'],
          pointRadius: 0,
          tension: 0.1,
        },
        {
          label: LINE_OBJECTS['line-mattapan'].name,
          data: data?.map((d) => (d['Mattapan'] / 60).toFixed(2)),
          borderColor: LINE_COLORS['line-mattapan'],
          backgroundColor: LINE_COLORS['line-mattapan'],
          pointRadius: 0,
          tension: 0.1,
        },
      ];
  return (
    <ChartStack>
      <ChartDiv isMobile={isMobile}>
        <Line
          ref={ref}
          id={`total-slow-time${line !== undefined ? `-${lineShort}` : ''}`}
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
                min: 0,
                ticks: {
                  color: COLORS.design.subtitleGrey,
                },
                title: {
                  display: true,
                  text: t('common:chartUnits.minutes'),
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
                    locale: getDateFnsLocale(),
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
                mode: 'index',
                position: 'nearest',
                callbacks: {
                  title: (tooltipItems) => {
                    return `${tooltipItems[0].label.split(',').slice(0, 2).join(',')}`;
                  },
                  label: (tooltipItem) => {
                    if (!tooltipItem.parsed.y) return '';
                    const time = getFormattedTimeString(tooltipItem.parsed.y, 'minutes');
                    return isLinePage
                      ? t('chart.totalTooltip', { time })
                      : t('chart.lineTooltip', { line: tooltipItem.dataset.label, time });
                  },
                },
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
                if (showTitle) drawSimpleTitle(t('totalSlowTime'), chart);
              },
            },
            ChartjsPluginWatermark,
          ]}
        />
      </ChartDiv>
    </ChartStack>
  );
};
