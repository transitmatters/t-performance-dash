import React, { useRef } from 'react';
import { Bar } from 'react-chartjs-2';

import 'chartjs-adapter-date-fns';

import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import classNames from 'classnames';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { COLORS } from '../../../common/constants/colors';
import { drawSimpleTitle } from '../../../common/components/charts/Title';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import { watermarkLayout } from '../../../common/constants/charts';
import { ChartBorder } from '../../../common/components/charts/ChartBorder';
import type { LineDelays } from '../../../common/types/delays';
import { getFormattedTimeString } from '../../../common/utils/time';
import { filterOutZeroValues } from './utils';

interface DelayByCategoryGraphProps {
  data: LineDelays[];
  showTitle?: boolean;
}

const sumArray = (array: number[][]) => {
  const newArray: number[] = [];
  array.forEach((sub) => {
    sub.forEach((num, index) => {
      if (newArray[index]) {
        newArray[index] += num;
      } else {
        newArray[index] = num;
      }
    });
  });
  return newArray;
};

export const DelayByCategoryGraph: React.FC<DelayByCategoryGraphProps> = ({
  data,
  showTitle = false,
}) => {
  const { linePath } = useDelimitatedRoute();
  const ref = useRef();
  const isMobile = !useBreakpoint('md');

  const { labels, backgroundColors, delayTotals } = filterOutZeroValues(
    sumArray(
      data.map((datapoint) => {
        return [
          datapoint.disabled_vehicle,
          datapoint.door_problem,
          datapoint.power_problem,
          datapoint.signal_problem,
          datapoint.switch_problem,
          datapoint.brake_problem,
          datapoint.track_issue,
          datapoint.track_work,
          datapoint.car_traffic,
          datapoint.mechanical_problem,
          datapoint.flooding,
          datapoint.police_activity,
          datapoint.medical_emergency,
          datapoint.fire,
          datapoint.other,
        ];
      })
    )
  );

  return (
    <ChartBorder>
      <div className={classNames('h-72', 'flex w-full flex-row')}>
        <Bar
          id={`delayByCategory-${linePath}`}
          height={isMobile ? 200 : 240}
          ref={ref}
          redraw={true}
          data={{
            labels,
            datasets: [
              {
                label: `Delay by Category`,
                backgroundColor: backgroundColors,
                data: delayTotals,
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
                  label: (tooltipItem) => {
                    return `${tooltipItem.label} total delay: ${getFormattedTimeString(
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
            },
            scales: {
              y: {
                suggestedMin: 0,
                min: 0,
                beginAtZero: true,
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
                ticks: {
                  color: COLORS.design.subtitleGrey,
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
