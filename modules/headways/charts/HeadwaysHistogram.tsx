import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarController, BarElement, LinearScale, Title, Tooltip } from 'chart.js';
import 'chartjs-adapter-date-fns';
import React, { useMemo, useRef } from 'react';
import dayjs from 'dayjs';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { COLORS, LINE_COLORS } from '../../../common/constants/colors';
import { drawTitle } from '../../../common/components/charts/Title';
import { locationDetails } from '../../../common/utils/stations';
import type { HeadwaysChartProps } from '../../../common/types/charts';
import { MetricFieldKeys } from '../../../common/types/charts';
import type { HeadwayPoint } from '../../../common/types/dataPoints';

ChartJS.register(BarController, BarElement, LinearScale, Title, Tooltip);

export const HeadwaysHistogram: React.FC<HeadwaysChartProps> = ({
  headways,
  toStation,
  fromStation,
}) => {
  const {
    line,
    linePath,
    lineShort,
    query: { startDate },
  } = useDelimitatedRoute();

  const ref = useRef();

  // dataObject is a mapping from headway bucket -> number of trains.
  // All keys are increased by 0.5. This is a workaround to get chartjs to display the tick labels in between the bars.
  const dataObject: Record<string, number> = useMemo(() => {
    const values =
      headways.data?.map(
        (datapoint: HeadwayPoint) =>
          Math.floor(datapoint[MetricFieldKeys.headwayTimeSec] / 60) + 0.5
      ) || [];
    const max = Math.max(...values);
    const headwayBuckets = {};
    for (let i = 0.5; i <= max; i++) {
      headwayBuckets[i] = 0;
    }
    values.forEach((datapoint) => {
      headwayBuckets[datapoint] += 1;
    });
    return headwayBuckets;
  }, [headways.data]);

  const isLoading = useMemo(
    () => headways.isLoading || toStation === undefined || fromStation === undefined,
    [headways.isLoading, fromStation, toStation]
  );

  const histogram = useMemo(() => {
    return (
      <Bar
        id={`headways-histogram-${linePath}`}
        ref={ref}
        height={250}
        redraw={true}
        data={{
          datasets: [
            {
              backgroundColor: LINE_COLORS[line ?? 'default'],
              label: lineShort !== 'Bus' ? 'Trains' : 'Buses',
              data: dataObject,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'linear',
              offset: false,
              grid: {
                offset: false,
              },
              ticks: {
                stepSize: 1,
                color: COLORS.design.subtitleGrey,
              },
              title: {
                display: true,
                text: `Minutes`,
                color: COLORS.design.subtitleGrey,
              },
            },
            y: {
              title: {
                display: true,
                text: lineShort !== 'Bus' ? 'Trains' : 'Buses',
                color: COLORS.design.subtitleGrey,
              },
              ticks: {
                color: COLORS.design.subtitleGrey,
              },
            },
          },
          layout: {
            padding: {
              top: 25,
            },
          },
          plugins: {
            tooltip: {
              mode: 'index',
              callbacks: {
                title: (items) => {
                  if (!items.length) {
                    return '';
                  }
                  const item = items[0];
                  const x = item.parsed.x;
                  const min = x - 0.5;
                  const max = x + 0.5;
                  return `${min} - ${max} min.`;
                },
              },
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
          interaction: {
            mode: 'nearest',
            intersect: false,
          },
        }}
        plugins={[
          {
            id: 'customTitle',
            afterDraw: (chart) => {
              if ((startDate === undefined || startDate.length === 0) && !isLoading) {
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
              drawTitle(
                `Headways by train (${dayjs(startDate).format('M/D/YYYY')})`,
                locationDetails(fromStation, toStation, lineShort),
                false,
                chart
              );
            },
          },
        ]}
      />
    );
  }, [dataObject, fromStation, isLoading, line, linePath, lineShort, startDate, toStation]);
  return histogram;
};
