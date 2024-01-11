import React, { useRef } from 'react';
import { Line } from 'react-chartjs-2';

import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';

import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import { max } from 'date-fns';
import dayjs from 'dayjs';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { CHART_COLORS, COLORS, LINE_COLORS } from '../../../common/constants/colors';
import type { DataPoint, TimePredictionWeek } from '../../../common/types/dataPoints';
import { drawSimpleTitle } from '../../../common/components/charts/Title';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import { watermarkLayout } from '../../../common/constants/charts';
import { ChartBorder } from '../../../common/components/charts/ChartBorder';
import { ChartDiv } from '../../../common/components/charts/ChartDiv';
import { PEAK_SPEED } from '../../../common/constants/baselines';
import { getRemainingBlockAnnotation } from '../../service/utils/graphUtils';
import { DATE_FORMAT, TODAY } from '../../../common/constants/dates';
import { DownloadButton } from '../../../common/components/buttons/DownloadButton';
import type { AggregateDataPoint } from '../../../common/types/charts';
import { addAccuracyPercentageToData } from '../utils/utils';

interface PredictionsGraphProps {
  data: TimePredictionWeek[];
  startDate: string;
  endDate: string;
  showTitle?: boolean;
}

export const PredictionsGraph: React.FC<PredictionsGraphProps> = ({
  data,
  startDate,
  endDate,
  showTitle = false,
}) => {
  const { line, linePath } = useDelimitatedRoute();
  const peak = PEAK_SPEED[line ?? 'DEFAULT'];
  const ref = useRef();
  const isMobile = !useBreakpoint('md');
  const labels = data.map((point) => point.week);
  const remainingBlocks = getRemainingBlockAnnotation(
    dayjs(max(data.map(({ prediction }) => dayjs(prediction[0].weekly).toDate())))
      .add(1, 'day')
      .format(DATE_FORMAT) ?? TODAY.format(DATE_FORMAT)
  );

  const reducedData = data.map(({ week, prediction }) => ({
    week: week,
    num_predictions: prediction.reduce((total, { num_predictions }) => {
      if (total !== undefined && num_predictions !== undefined) {
        return total + num_predictions;
      } else {
        return total;
      }
    }, 0),
    num_accurate_predictions: prediction.reduce((total, { num_accurate_predictions }) => {
      if (total !== undefined && num_accurate_predictions !== undefined) {
        return total + num_accurate_predictions;
      } else {
        return total;
      }
    }, 0),
  }));

  const dataWithPercentage = addAccuracyPercentageToData(data);

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
                label: `Arrival Predictions`,
                borderColor: LINE_COLORS[line ?? 'default'],
                pointRadius: 0,
                pointBorderWidth: 0,
                stepped: true,
                pointHoverRadius: 6,
                spanGaps: false,
                pointHoverBackgroundColor: LINE_COLORS[line ?? 'default'],
                pointBackgroundColor: LINE_COLORS[line ?? 'default'],
                data: reducedData.map((datapoint) =>
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
                display: false,
              },
              title: {
                // empty title to set font and leave room for drawTitle fn
                display: showTitle,
                text: '',
              },
              annotation: {
                // Add your annotations here
                annotations: [
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
      <div className="flex flex-row items-end justify-end gap-4">
        {startDate && (
          <DownloadButton
            data={dataWithPercentage as unknown as (DataPoint | AggregateDataPoint)[]}
            datasetName="ridership predictions"
            bothStops={false}
            startDate={startDate}
            endDate={endDate}
          />
        )}
      </div>
    </ChartBorder>
  );
};
