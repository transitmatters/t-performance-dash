import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarController, BarElement, LinearScale, Title, Tooltip } from 'chart.js';
import 'chartjs-adapter-date-fns';
import React, { useMemo, useRef } from 'react';
import dayjs from 'dayjs';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { LINE_COLORS } from '../../../common/constants/colors';
import { drawTitle } from '../../../common/components/charts/Title';
import { MetricFieldKeys } from '../../../src/charts/types';
import { locationDetails } from '../../../common/utils/stations';
import type { HeadwayPoint } from '../../../common/types/dataPoints';
import type { HeadwaysChartProps } from '../../../common/types/charts';

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
    let max = 0.5;
    return (
      headways.data?.reduce(
        (datapointMap: Record<string, number>, datapoint: HeadwayPoint) => {
          const bucketString = (
            Math.floor(datapoint[MetricFieldKeys.headwayTimeSec] / 60) + 0.5
          ).toString();

          // If the bucket doesn't exist, create all buckets leading up to it and set them to 0.
          while (datapointMap[bucketString] == null) {
            max += 1;
            datapointMap[max.toString()] = 0;
          }
          // Increment the value for this bucket.
          datapointMap[bucketString] = datapointMap[bucketString] + 1;
          return datapointMap;
        },
        { '0.5': 0 }
      ) || {}
    );
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
              label: `Trains`,
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
              },
              title: {
                display: true,
                text: `Minutes`,
              },
            },
            y: {
              title: {
                display: true,
                text: 'Trains',
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
