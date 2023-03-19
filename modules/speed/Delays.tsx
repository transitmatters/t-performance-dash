import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { enUS } from 'date-fns/locale';

import { useDelimitatedRoute } from '../../common/utils/router';
import { COLORS, LINE_COLORS } from '../../common/constants/colors';
import { TimeRange } from '../dashboard/LineHealth';
import { DELAYS_RANGE_PARAMS_MAP, MINIMUMS } from './constants/delays';
import { MedianTraversalTime } from '../../common/types/dataPoints';

ChartJS.register(
  CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

interface DelaysProps {
  timeRange: TimeRange;
  data: MedianTraversalTime[]; //todo: type
}

// TODO: memoize this shit
export const Delays: React.FC<DelaysProps> = ({ data, timeRange }) => {
  const { line } = useDelimitatedRoute();
  const { tooltipFormat, unit, startDate, endDate } = DELAYS_RANGE_PARAMS_MAP[timeRange];

  const min = MINIMUMS[line ?? 'DEFAULT'];
  const labels = data.map((point) => point.date);
  return (
    <div>
      <Line
        id={'Traversal Times'}
        // TODO: add ref???
        height={250}
        redraw={true}
        data={{
          labels,
          datasets: [
            {
              label: `Percent`,
              borderColor: '#a0a0a030',
              pointRadius: 8,
              pointBackgroundColor: 'transparent',
              fill: {
                target: 'origin',
                above: LINE_COLORS[line ?? 'default'],
              },

              pointBorderWidth: 0,
              pointHoverRadius: 3,
              pointHoverBackgroundColor: LINE_COLORS[line ?? 'default'],

              // TODO: would be nice to add types to these arrow functions - but causes an issue bc datapoint[field] might be undefined.
              data: data.map((datapoint: any) => (100 * datapoint['value']) / min - 100),
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              top: 25,
            },
          },
          plugins: {
            tooltip: {
              mode: 'index',
              position: 'nearest',
            },
            legend: {
              display: false,
            },
            title: {
              // empty title to set font and leave room for drawTitle fn
              display: true,
              text: '',
            },
          },
          scales: {
            y: {
              min: -5,
              suggestedMax: 100,
              display: true,
              ticks: {
                color: COLORS.design.subtitleGrey,
              },
              title: {
                display: true,
                text: 'Percent',
                color: COLORS.design.subtitleGrey,
              },
            },
            x: {
              min: startDate,
              max: endDate,
              type: 'time',
              time: {
                unit: unit,
                tooltipFormat: tooltipFormat, // locale time with seconds
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
                text: 'No date selected',
                color: COLORS.design.subtitleGrey,
              },
            },
          },
          // animation: false,
        }}
      />
    </div>
  );
};
