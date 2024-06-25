import React, { useRef } from 'react';
import { Line } from 'react-chartjs-2';

import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';

import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import classNames from 'classnames';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { COLORS, LINE_COLORS } from '../../../common/constants/colors';
import { drawSimpleTitle } from '../../../common/components/charts/Title';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import { watermarkLayout } from '../../../common/constants/charts';
import { ChartBorder } from '../../../common/components/charts/ChartBorder';
import type { LineDelays } from '../../../common/types/reliability';
import { getFormattedTimeString } from '../../../common/utils/time';
import { hexWithAlpha } from '../../../common/utils/general';

interface DelayBreakdownGraphProps {
  data: LineDelays[];
  startDate: string;
  endDate: string;
  showTitle?: boolean;
}

export const DelayBreakdownGraph: React.FC<DelayBreakdownGraphProps> = ({
  data,
  startDate,
  endDate,
  showTitle = false,
}) => {
  const { line, linePath } = useDelimitatedRoute();
  const ref = useRef();
  const isMobile = !useBreakpoint('md');
  const labels = data.map((point) => point.date);

  const lineColor = LINE_COLORS[line ?? 'default'];

  return (
    <ChartBorder>
      <div className={classNames('h-72', 'flex w-full flex-row')}>
        <Line
          id={`breakdownDelay-${linePath}`}
          height={isMobile ? 200 : 240}
          ref={ref}
          redraw={true}
          data={{
            labels,
            datasets: [
              {
                label: `Disabled Train`,
                borderColor: '#dc2626',
                backgroundColor: hexWithAlpha('#dc2626', 0.8),
                pointRadius: 0,
                pointBorderWidth: 0,
                fill: true,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: lineColor,
                data: data.map((datapoint) => datapoint.disabled_train),
              },
              {
                label: `Door Problem`,
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
                label: `Power/Wire Issue`,
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
                label: `Signal Problem`,
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
                label: `Switch Problem`,
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
                label: `Brake Issue`,
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
                label: `Track Issue`,
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
                label: `Flooding`,
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
                label: `Police Activity`,
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
                label: `Medical Emergency`,
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
                label: `Fire Department Activity`,
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
                label: `Other`,
                borderColor: '#6b7280',
                backgroundColor: hexWithAlpha('#6b7280', 0.8),
                pointRadius: 0,
                pointBorderWidth: 0,
                fill: true,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: lineColor,
                data: data.map((datapoint) => datapoint.other),
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
                    return `Week of ${context[0].label}`;
                  },
                  label: (tooltipItem) => {
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
                  text: 'Time delayed (minutes)',
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
                    locale: enUS,
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
                  ctx.fillText('No data to display', width / 2, height / 2);
                  ctx.restore();
                }
                if (showTitle) drawSimpleTitle(`Speed`, chart);
              },
            },
            ChartjsPluginWatermark,
          ]}
        />
      </div>
    </ChartBorder>
  );
};
