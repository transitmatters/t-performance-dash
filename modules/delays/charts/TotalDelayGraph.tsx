import React, { useRef } from 'react';
import { Line } from '@chartjs-components';

import 'chartjs-adapter-date-fns';
import dayjs from 'dayjs';
import { max, min } from 'date-fns';

import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import { useTranslation } from 'react-i18next';
import { getDateFnsLocale } from '../../../common/i18n/format';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { COLORS, LINE_COLORS } from '../../../common/constants/colors';
import { drawSimpleTitle } from '../../../common/components/charts/Title';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import { watermarkLayout } from '../../../common/constants/charts';
import { ChartStack } from '../../../common/components/charts/ChartStack';
import { ChartDiv } from '../../../common/components/charts/ChartDiv';
import type { LineDelays } from '../../../common/types/delays';
import { getFormattedTimeString } from '../../../common/utils/time';
import { hexWithAlpha } from '../../../common/utils/general';
import { getRemainingBlockAnnotation } from '../../service/utils/graphUtils';
import { DATE_FORMAT, TODAY } from '../../../common/constants/dates';

interface TotalDelayGraphProps {
  data: LineDelays[];
  startDate: string;
  endDate: string;
  showTitle?: boolean;
  agg?: 'daily' | 'weekly';
}

export const TotalDelayGraph: React.FC<TotalDelayGraphProps> = ({
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
      <ChartDiv isMobile={isMobile}>
        <Line
          id={`totaldelay-${linePath}`}
          height={isMobile ? 240 : 200}
          ref={ref}
          redraw={true}
          data={{
            labels,
            datasets: [
              {
                label: t('totalDelayed'),
                borderColor: lineColor,
                backgroundColor: hexWithAlpha(lineColor, 0.8),
                pointRadius: 0,
                pointBorderWidth: 0,
                fill: true,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: lineColor,
                data: data.map((datapoint) => datapoint.total_delay_time),
              },
            ],
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
                display: false,
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
                suggestedMin: 0,
                min: 0,
                display: true,
                ticks: {
                  color: COLORS.design.subtitleGrey,
                },
                title: {
                  display: true,
                  text: t('charts.totalDelayedAxis'),
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
      </ChartDiv>
    </ChartStack>
  );
};
