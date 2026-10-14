import React, { useRef } from 'react';
import { Line } from '@chartjs-components';

import 'chartjs-adapter-date-fns';
import dayjs from 'dayjs';
import { max, min } from 'date-fns';

import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { reasonLabel } from '../utils';
import { getDateFnsLocale } from '../../../common/i18n/format';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { COLORS, LINE_COLORS } from '../../../common/constants/colors';
import { drawSimpleTitle } from '../../../common/components/charts/Title';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import { watermarkLayout } from '../../../common/constants/charts';
import { ChartStack } from '../../../common/components/charts/ChartStack';
import type { LineDelays } from '../../../common/types/delays';
import { getFormattedTimeString } from '../../../common/utils/time';
import { hexWithAlpha } from '../../../common/utils/general';
import { getRemainingBlockAnnotation } from '../../service/utils/graphUtils';
import { DATE_FORMAT, TODAY } from '../../../common/constants/dates';
import { filterOutZeroValueDatasets } from './utils';

interface DelayBreakdownGraphProps {
  data: LineDelays[];
  startDate: string;
  endDate: string;
  showTitle?: boolean;
  agg?: 'daily' | 'weekly';
}

export const DelayBreakdownGraph: React.FC<DelayBreakdownGraphProps> = ({
  data,
  startDate,
  endDate,
  showTitle = false,
  agg = 'weekly',
}) => {
  const { t } = useTranslation(['delays', 'common']);
  const { line, linePath } = useDelimitatedRoute();
  const ref = useRef(null);
  const isMobile = !useBreakpoint('md');
  const labels = data.map((point) => point.date);

  const lineColor = LINE_COLORS[line ?? 'default'];

  const remainingBlocks = getRemainingBlockAnnotation(
    dayjs(max(data.map((delay) => dayjs(delay.date).toDate()))).format(DATE_FORMAT) ??
      TODAY.format(DATE_FORMAT)
  );
  const earlierBlocks = getRemainingBlockAnnotation(
    undefined,
    dayjs(min(data.map((delay) => dayjs(delay.date).toDate()))).format(DATE_FORMAT)
  );

  return (
    <ChartStack>
      <div className={classNames('h-72', 'flex w-full flex-row')}>
        <Line
          id={`breakdownDelay-${linePath}`}
          height={isMobile ? 200 : 240}
          ref={ref}
          redraw={true}
          data={{
            labels,
            datasets: filterOutZeroValueDatasets([
              {
                label: reasonLabel('disabled_vehicle'),
                borderColor: '#dc2626',
                backgroundColor: hexWithAlpha('#dc2626', 0.8),
                pointRadius: 0,
                pointBorderWidth: 0,
                fill: true,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: lineColor,
                data: data.map((datapoint) => datapoint.disabled_vehicle),
              },
              {
                label: reasonLabel('door_problem'),
                borderColor: '#3f6212',
                backgroundColor: hexWithAlpha('#3f6212', 0.8),
                pointRadius: 0,
                pointBorderWidth: 0,
                fill: true,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: lineColor,
                data: data.map((datapoint) => datapoint.door_problem),
              },
              {
                label: reasonLabel('power_problem'),
                borderColor: '#eab308',
                backgroundColor: hexWithAlpha('#eab308', 0.8),
                pointRadius: 0,
                pointBorderWidth: 0,
                fill: true,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: lineColor,
                data: data.map((datapoint) => datapoint.power_problem),
              },
              {
                label: reasonLabel('signal_problem'),
                borderColor: '#84cc16',
                backgroundColor: hexWithAlpha('#84cc16', 0.8),
                pointRadius: 0,
                pointBorderWidth: 0,
                fill: true,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: lineColor,
                data: data.map((datapoint) => datapoint.signal_problem),
              },
              {
                label: reasonLabel('car_traffic'),
                borderColor: '#f59e0b',
                backgroundColor: hexWithAlpha('#f59e0b', 0.8),
                pointRadius: 0,
                pointBorderWidth: 0,
                fill: true,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: lineColor,
                data: data.map((datapoint) => datapoint.car_traffic),
              },
              {
                label: reasonLabel('track_work'),
                borderColor: '#f87171',
                backgroundColor: hexWithAlpha('#f87171', 0.8),
                pointRadius: 0,
                pointBorderWidth: 0,
                fill: true,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: lineColor,
                data: data.map((datapoint) => datapoint.track_work),
              },
              {
                label: reasonLabel('switch_problem'),
                borderColor: '#10b981',
                backgroundColor: hexWithAlpha('#10b981', 0.8),
                pointRadius: 0,
                pointBorderWidth: 0,
                fill: true,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: lineColor,
                data: data.map((datapoint) => datapoint.switch_problem),
              },
              {
                label: reasonLabel('brake_problem'),
                borderColor: '#4c1d95',
                backgroundColor: hexWithAlpha('#4c1d95', 0.8),
                pointRadius: 0,
                pointBorderWidth: 0,
                fill: true,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: lineColor,
                data: data.map((datapoint) => datapoint.brake_problem),
              },
              {
                label: reasonLabel('track_issue'),
                borderColor: '#8b5cf6',
                backgroundColor: hexWithAlpha('#8b5cf6', 0.8),
                pointRadius: 0,
                pointBorderWidth: 0,
                fill: true,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: lineColor,
                data: data.map((datapoint) => datapoint.track_issue),
              },
              {
                label: reasonLabel('mechanical_problem'),
                borderColor: '#451a03',
                backgroundColor: hexWithAlpha('#451a03', 0.8),
                pointRadius: 0,
                pointBorderWidth: 0,
                fill: true,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: lineColor,
                data: data.map((datapoint) => datapoint.mechanical_problem),
              },
              {
                label: reasonLabel('flooding'),
                borderColor: '#0ea5e9',
                backgroundColor: hexWithAlpha('#0ea5e9', 0.8),
                pointRadius: 0,
                pointBorderWidth: 0,
                fill: true,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: lineColor,
                data: data.map((datapoint) => datapoint.flooding),
              },
              {
                label: reasonLabel('police_activity'),
                borderColor: '#1d4ed8',
                backgroundColor: hexWithAlpha('#1d4ed8', 0.8),
                pointRadius: 0,
                pointBorderWidth: 0,
                fill: true,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: lineColor,
                data: data.map((datapoint) => datapoint.police_activity),
              },
              {
                label: reasonLabel('medical_emergency'),
                borderColor: '#be123c',
                backgroundColor: hexWithAlpha('#be123c', 0.8),
                pointRadius: 0,
                pointBorderWidth: 0,
                fill: true,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: lineColor,
                data: data.map((datapoint) => datapoint.medical_emergency),
              },
              {
                label: reasonLabel('fire'),
                borderColor: '#ea580c',
                backgroundColor: hexWithAlpha('#ea580c', 0.8),
                pointRadius: 0,
                pointBorderWidth: 0,
                fill: true,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: lineColor,
                data: data.map((datapoint) => datapoint.fire),
              },
              {
                label: reasonLabel('other'),
                borderColor: '#6b7280',
                backgroundColor: hexWithAlpha('#6b7280', 0.8),
                pointRadius: 0,
                pointBorderWidth: 0,
                fill: true,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: lineColor,
                data: data.map((datapoint) => datapoint.other),
              },
            ]),
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            layout: {
              padding: {
                top: showTitle ? 25 : 0,
              },
            },
            interaction: {
              intersect: false,
            },
            // @ts-expect-error The watermark plugin doesn't have typescript support
            watermark: watermarkLayout(isMobile),
            plugins: {
              tooltip: {
                mode: 'index',
                position: 'nearest',
                callbacks: {
                  title: (context) => {
                    return agg === 'weekly'
                      ? t('common:charts.weekOf', { label: context[0].label })
                      : `${context[0].label}`;
                  },
                  label: (tooltipItem) => {
                    if (!tooltipItem.parsed.y) return '';
                    return `${tooltipItem.dataset.label}: ${getFormattedTimeString(
                      tooltipItem.parsed.y,
                      'minutes'
                    )}`;
                  },
                },
              },
              legend: {
                position: 'bottom',
                labels: {
                  boxWidth: 15,
                },
              },
              title: {
                // empty title to set font and leave room for drawTitle fn
                display: showTitle,
                text: '',
              },
              annotation: {
                // Add your annotations here
                annotations: [...earlierBlocks, ...remainingBlocks],
              },
            },
            scales: {
              y: {
                stacked: true,
                suggestedMin: 0,
                min: 0,
                display: true,
                ticks: {
                  color: COLORS.design.subtitleGrey,
                },
                title: {
                  display: true,
                  text: t('charts.timeDelayedAxis'),
                  color: COLORS.design.subtitleGrey,
                },
              },
              x: {
                min: startDate,
                max: endDate,
                type: 'time',
                time: {
                  unit: 'day',
                  tooltipFormat: 'MMM d, yyyy',
                  displayFormats: {
                    month: 'MMM',
                  },
                },
                ticks: {
                  color: COLORS.design.subtitleGrey,
                },
                adapters: {
                  date: {
                    locale: getDateFnsLocale(),
                  },
                },
                display: true,
                title: {
                  display: false,
                  text: ``,
                },
              },
            },
          }}
          plugins={[
            {
              id: 'customTitle',
              afterDraw: (chart) => {
                if (!data) {
                  // No data is present
                  const { ctx } = chart;
                  const { width } = chart;
                  const { height } = chart;
                  chart.clear();

                  ctx.save();
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.font = "16px normal 'Helvetica Nueue'";
                  ctx.fillText(t('common:charts.noDataToDisplay'), width / 2, height / 2);
                  ctx.restore();
                }
                if (showTitle) drawSimpleTitle(t('common:chartExport.titles.speed'), chart);
              },
            },
            ChartjsPluginWatermark,
          ]}
        />
      </div>
    </ChartStack>
  );
};
