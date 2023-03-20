import React, { useRef } from 'react';
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
import { DELAYS_RANGE_PARAMS_MAP, MINIMUMS } from './constants/delays';
import { MedianTraversalTime } from '../../common/types/dataPoints';
import { TimeRange, TimeRangeNames } from '../../common/types/inputs';
import { drawPlainTitle } from '../../common/components/charts/Title';

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
  const { line, lineShort } = useDelimitatedRoute();
  const { tooltipFormat, unit, startDate, endDate, callbacks } = DELAYS_RANGE_PARAMS_MAP[timeRange];
  const ref = useRef();

  const min = MINIMUMS[line ?? 'DEFAULT'];
  const labels = data.map((point) => point.date);
  return (
    <div>
      <Line
        id={'Traversal Times'}
        ref={ref}
        height={250}
        redraw={true}
        data={{
          labels,
          datasets: [
            {
              label: `Percent`,
              borderColor: 'transparent',
              pointRadius: 8,
              pointBackgroundColor: 'transparent',
              fill: {
                target: 'origin',
                above: LINE_COLORS[line ?? 'default'],
              },
              pointBorderWidth: 0,
              pointHoverRadius: 3,
              pointHoverBackgroundColor: LINE_COLORS[line ?? 'default'],
              data: data.map((datapoint) => Math.round((100 * min) / datapoint.value)),
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
          interaction: {
            intersect: false,
          },
          plugins: {
            tooltip: {
              mode: 'index',
              position: 'nearest',
              callbacks: callbacks,
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
              suggestedMin: 0,
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
                tooltipFormat: tooltipFormat,
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
                text: `${TimeRangeNames[timeRange]}`,
                color: COLORS.design.subtitleGrey,
              },
            },
          },
        }}
        plugins={[
          {
            id: 'customTitle',
            afterDraw: (chart) => {
              if (startDate === undefined || startDate.length === 0) {
                // No data is present
                const ctx = chart.ctx;
                const width = chart.width;
                const height = chart.height;
                chart.clear();

                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = "16px normal 'Helvetica Nueue'";
                ctx.fillText('No data to display', width / 2, height / 2);
                ctx.restore();
              }
              drawPlainTitle(`Speed compared to peak`, chart);
            },
          },
        ]}
      />
    </div>
  );
};
