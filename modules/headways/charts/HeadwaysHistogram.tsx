import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarController, BarElement, LinearScale, Title, Tooltip } from 'chart.js';
import 'chartjs-adapter-date-fns';
import React, { useMemo, useRef } from 'react';
import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { COLORS, LINE_COLORS } from '../../../common/constants/colors';
import type { HeadwaysChartProps } from '../../../common/types/charts';
import { MetricFieldKeys } from '../../../common/types/charts';
import type { HeadwayPoint } from '../../../common/types/dataPoints';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import { watermarkLayout } from '../../../common/constants/charts';
import { ChartDiv } from '../../../common/components/charts/ChartDiv';
import { ChartBorder } from '../../../common/components/charts/ChartBorder';

ChartJS.register(BarController, BarElement, LinearScale, ChartjsPluginWatermark, Title, Tooltip);

export const HeadwaysHistogram: React.FC<HeadwaysChartProps> = ({ headways }) => {
  const { line, linePath, lineShort } = useDelimitatedRoute();

  const ref = useRef();
  const isMobile = !useBreakpoint('md');

  // dataObject is a mapping from headway bucket -> number of trains.
  // All keys are increased by 0.5. This is a workaround to get chartjs to display the tick labels in between the bars.
  const dataObject: Record<string, number> = useMemo(() => {
    const values =
      headways.map(
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
  }, [headways]);

  const histogram = useMemo(() => {
    return (
      <ChartBorder>
        <ChartDiv>
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
              // @ts-expect-error The watermark plugin doesn't have typescript support
              watermark: watermarkLayout(isMobile),
              plugins: {
                tooltip: {
                  mode: 'index',
                  callbacks: {
                    title: (items) => {
                      if (!items.length) {
                        return '';
                      }
                      const item = items[0];
                      const { x } = item.parsed;
                      const min = x - 0.5;
                      const max = x + 0.5;
                      return `${min} - ${max} min.`;
                    },
                  },
                },
                legend: {
                  display: false,
                },
              },
              interaction: {
                mode: 'nearest',
                intersect: false,
              },
            }}
          />
        </ChartDiv>
      </ChartBorder>
    );
  }, [dataObject, isMobile, line, linePath, lineShort]);
  return histogram;
};
