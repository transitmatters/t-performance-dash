import React, { useRef } from 'react';
import { Line } from 'react-chartjs-2';

import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';

import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import { flatten } from 'lodash';
import { useDelimitatedRoute } from '../../common/utils/router';
import { CHART_COLORS, COLORS, LINE_COLORS } from '../../common/constants/colors';
import type { PredictionBin, TimePredictionWeek } from '../../common/types/dataPoints';
import { drawSimpleTitle } from '../../common/components/charts/Title';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { watermarkLayout } from '../../common/constants/charts';
import { ChartBorder } from '../../common/components/charts/ChartBorder';
import { ChartDiv } from '../../common/components/charts/ChartDiv';
import { PEAK_SPEED } from '../../common/constants/baselines';
import { ToggleSwitch } from '../../common/components/inputs/ToggleSwitch';

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

  const [selectedBins, setSelectedBins] = React.useState<PredictionBin[]>([
    '0-3 min',
    '3-6 min',
    '6-12 min',
    '12-30 min',
  ]);

  // Filter data to selected bins
  const filteredData = flatten(
    data
      .map(({ prediction }) => prediction.filter(({ bin }) => selectedBins.includes(bin)))
      .filter((p) => p !== undefined)
  );

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
                label: `Time Predictions`,
                borderColor: LINE_COLORS[line ?? 'default'],
                pointRadius: 0,
                pointBorderWidth: 0,
                stepped: true,
                pointHoverRadius: 6,
                spanGaps: false,
                pointHoverBackgroundColor: LINE_COLORS[line ?? 'default'],
                pointBackgroundColor: LINE_COLORS[line ?? 'default'],
                data: filteredData.map((datapoint) =>
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
                  text: 'Percentage Accurate',
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
                if (showTitle) drawSimpleTitle(`Time Predictions`, chart);
              },
            },
            ChartjsPluginWatermark,
          ]}
        />
      </ChartDiv>
      <div className={'self-center'}>
        <ToggleSwitch
          label={'0-3 mins'}
          enabled={selectedBins.includes('0-3 min')}
          setEnabled={(enabled) => {
            if (enabled) {
              setSelectedBins([...selectedBins, '0-3 min']);
            } else {
              setSelectedBins(selectedBins.filter((bin) => bin !== '0-3 min'));
            }
          }}
        />
        <ToggleSwitch
          label={'3-6 mins'}
          enabled={selectedBins.includes('3-6 min')}
          setEnabled={(enabled) => {
            if (enabled) {
              setSelectedBins([...selectedBins, '3-6 min']);
            } else {
              setSelectedBins(selectedBins.filter((bin) => bin !== '3-6 min'));
            }
          }}
        />
        <ToggleSwitch
          label={'6-12 mins'}
          enabled={selectedBins.includes('6-12 min')}
          setEnabled={(enabled) => {
            if (enabled) {
              setSelectedBins([...selectedBins, '6-12 min']);
            } else {
              setSelectedBins(selectedBins.filter((bin) => bin !== '6-12 min'));
            }
          }}
        />
        <ToggleSwitch
          label={'12+ mins'}
          enabled={selectedBins.includes('12-30 min')}
          setEnabled={(enabled) => {
            if (enabled) {
              setSelectedBins([...selectedBins, '12-30 min']);
            } else {
              setSelectedBins(selectedBins.filter((bin) => bin !== '12-30 min'));
            }
          }}
        />
      </div>
    </ChartBorder>
  );
};
