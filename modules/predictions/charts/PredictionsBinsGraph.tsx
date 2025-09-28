import React, { useRef } from 'react';
import { Line } from 'react-chartjs-2';

import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';

import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import dayjs from 'dayjs';
import { max, min } from 'date-fns';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { CHART_COLORS, COLORS, LINE_COLORS_LEVELS } from '../../../common/constants/colors';
import type { TimePredictionWeek } from '../../../common/types/dataPoints';
import { drawSimpleTitle } from '../../../common/components/charts/Title';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import { watermarkLayout } from '../../../common/constants/charts';
import { ChartBorder } from '../../../common/components/charts/ChartBorder';
import { ChartDiv } from '../../../common/components/charts/ChartDiv';
import { PEAK_SPEED } from '../../../common/constants/baselines';
import { getRemainingBlockAnnotation } from '../../service/utils/graphUtils';
import { DATE_FORMAT, TODAY } from '../../../common/constants/dates';

interface PredictionsBinsGraphProps {
  data: TimePredictionWeek[];
  startDate: string;
  endDate: string;
  showTitle?: boolean;
}

export const PredictionsBinsGraph: React.FC<PredictionsBinsGraphProps> = ({
  data,
  startDate,
  endDate,
  showTitle = false,
}) => {
  const { line, linePath } = useDelimitatedRoute();
  const peak = PEAK_SPEED[line ?? 'DEFAULT'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null);
  const isMobile = !useBreakpoint('md');
  const labels = data.map((point) => point.week);
  const remainingBlocks = getRemainingBlockAnnotation(
    dayjs(max(data.map(({ prediction }) => dayjs(prediction[0].weekly).toDate())))
      .add(1, 'day')
      .format(DATE_FORMAT) ?? TODAY.format(DATE_FORMAT)
  );
  const earlierBlocks = getRemainingBlockAnnotation(
    undefined,
    dayjs(min(data.map(({ prediction }) => dayjs(prediction[0].weekly).toDate()))).format(
      DATE_FORMAT
    )
  );

  // Split data by bin
  const bin0to3 = data
    .map(({ prediction }) => prediction.find(({ bin }) => bin === '0-3 min'))
    .filter((p) => p !== undefined);
  const bin3to6 = data
    .map(({ prediction }) => prediction.find(({ bin }) => bin === '3-6 min'))
    .filter((p) => p !== undefined);
  const bin6to12 = data
    .map(({ prediction }) => prediction.find(({ bin }) => bin === '6-12 min'))
    .filter((p) => p !== undefined);
  const bin12to30 = data
    .map(({ prediction }) => prediction.find(({ bin }) => bin === '12-30 min'))
    .filter((p) => p !== undefined);

  return (
    <ChartBorder>
      <ChartDiv isMobile={isMobile}>
        <Line
          id={`speed-${linePath}`}
          height={isMobile ? 240 : 200}
          ref={ref}
          redraw={true}
          data={{
            labels,
            datasets: [
              {
                label: `0-3min predictions`,
                borderColor: LINE_COLORS_LEVELS[line ?? 'default'][0],
                pointRadius: 0,
                pointBorderWidth: 0,
                stepped: true,
                pointHoverRadius: 6,
                spanGaps: false,
                pointHoverBackgroundColor: LINE_COLORS_LEVELS[line ?? 'default'][0],
                pointBackgroundColor: LINE_COLORS_LEVELS[line ?? 'default'][0],
                data: bin0to3.map((datapoint) =>
                  (
                    (datapoint?.num_accurate_predictions / datapoint?.num_predictions) *
                    100
                  ).toFixed(2)
                ),
              },
              {
                label: `3-6min predictions`,
                borderColor: LINE_COLORS_LEVELS[line ?? 'default'][1],
                pointRadius: 0,
                pointBorderWidth: 0,
                stepped: true,
                pointHoverRadius: 6,
                spanGaps: false,
                pointHoverBackgroundColor: LINE_COLORS_LEVELS[line ?? 'default'][1],
                pointBackgroundColor: LINE_COLORS_LEVELS[line ?? 'default'][1],
                data: bin3to6.map((datapoint) =>
                  (
                    (datapoint?.num_accurate_predictions / datapoint?.num_predictions) *
                    100
                  ).toFixed(2)
                ),
              },
              {
                label: `6-12min predictions`,
                borderColor: LINE_COLORS_LEVELS[line ?? 'default'][2],
                pointRadius: 0,
                pointBorderWidth: 0,
                stepped: true,
                pointHoverRadius: 6,
                spanGaps: false,
                pointHoverBackgroundColor: LINE_COLORS_LEVELS[line ?? 'default'][2],
                pointBackgroundColor: LINE_COLORS_LEVELS[line ?? 'default'][2],
                data: bin6to12.map((datapoint) =>
                  (
                    (datapoint?.num_accurate_predictions / datapoint?.num_predictions) *
                    100
                  ).toFixed(2)
                ),
              },
              {
                label: `12-30min predictions`,
                borderColor: LINE_COLORS_LEVELS[line ?? 'default'][3],
                pointRadius: 0,
                pointBorderWidth: 0,
                stepped: true,
                pointHoverRadius: 6,
                spanGaps: false,
                pointHoverBackgroundColor: LINE_COLORS_LEVELS[line ?? 'default'][3],
                pointBackgroundColor: LINE_COLORS_LEVELS[line ?? 'default'][3],
                data: bin12to30.map((datapoint) =>
                  (
                    (datapoint?.num_accurate_predictions / datapoint?.num_predictions) *
                    100
                  ).toFixed(2)
                ),
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
                  label: (context) => {
                    return `${context.dataset.label}: ${context.parsed.y}% accurate`;
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
                annotations: [
                  ...earlierBlocks,
                  {
                    type: 'line',
                    yMin: peak,
                    yMax: peak,
                    borderColor: CHART_COLORS.ANNOTATIONS,
                    // corresponds to null dataset index.
                    display: (ctx) => ctx.chart.isDatasetVisible(1),
                    borderWidth: 2,
                  },
                  ...remainingBlocks,
                ],
              },
            },
            scales: {
              y: {
                suggestedMin: 75,
                suggestedMax: 100,
                display: true,
                ticks: {
                  color: COLORS.design.subtitleGrey,
                },
                title: {
                  display: true,
                  text: 'Accuracy (%)',
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
                if (showTitle) drawSimpleTitle(`Arrival Predictions`, chart);
              },
            },
            ChartjsPluginWatermark,
          ]}
        />
      </ChartDiv>
    </ChartBorder>
  );
};
