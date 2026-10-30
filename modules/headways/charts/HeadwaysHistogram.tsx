import { Bar } from '@chartjs-components';
import 'chartjs-adapter-date-fns';
import { useMemo, useRef } from 'react';
import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { CHART_COLORS, LINE_COLORS } from '../../../common/constants/colors';
import type { HeadwayTooltipData, HeadwaysChartProps } from '../../../common/types/charts';
import { MetricFieldKeys } from '../../../common/types/charts';
import type { HeadwayPoint } from '../../../common/types/dataPoints';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import { watermarkLayout } from '../../../common/constants/charts';
import { useChartTheme } from '../../../common/utils/chartTheme';
import { ChartDiv } from '../../../common/components/charts/ChartDiv';
import { ChartStack } from '../../../common/components/charts/ChartStack';
import { getFormattedTimeString } from '../../../common/utils/time';
import { TripEmbedButton } from '../../tripexplorer/TripEmbedButton';

export const HeadwaysHistogram = ({ headways, fill = false }: HeadwaysChartProps) => {
  const { line, linePath, lineShort } = useDelimitatedRoute();

  const ref = useRef(null);
  const chartTheme = useChartTheme();
  const isMobile = !useBreakpoint('md');

  const benchmarkTime = headways[0]?.benchmark_headway_time_sec ?? 0;

  // dataObject is a mapping from headway bucket -> number of trains.
  // All keys are increased by 0.5. This is a workaround to get chartjs to display the tick labels in between the bars.
  const dataObject: Record<string, number> = useMemo(() => {
    const values =
      headways.map(
        (datapoint: HeadwayPoint) =>
          Math.floor(datapoint[MetricFieldKeys.headwayTimeSec] / 60) + 0.5
      ) || [];
    const max = Math.max(...values);
    const headwayBuckets: { [key in number]: number } = {};
    for (let i = 0.5; i <= max; i++) {
      headwayBuckets[i] = 0;
    }
    values.forEach((datapoint) => {
      headwayBuckets[datapoint] += 1;
    });
    return headwayBuckets;
  }, [headways]);

  // headway bucket => % [of trains in that bucket, difference from benchmark]
  const headwayBucketPercentages: Record<string, HeadwayTooltipData> = useMemo(() => {
    const headwayBucketPercentages: { [key in string]: { pct_trains: number } } = {};
    Object.entries(dataObject).forEach(([k, v]) => {
      headwayBucketPercentages[k] = {
        pct_trains: Math.floor((100 * v) / headways.length),
      };
    });
    return headwayBucketPercentages;
  }, [headways, dataObject]);

  const histogram = useMemo(() => {
    return (
      <ChartStack className={fill ? 'h-full' : undefined}>
        <ChartDiv isMobile={isMobile} fill={fill}>
          <Bar
            id={`headways-histogram-${linePath}`}
            ref={ref}
            height={isMobile ? 200 : 240}
            redraw={true}
            data={{
              datasets: [
                {
                  backgroundColor: LINE_COLORS[line ?? 'default'],
                  label:
                    lineShort === 'Bus' ? 'Buses' : lineShort === 'Ferry' ? 'Ferries' : 'Trains',
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
                    color: chartTheme.grid,
                  },
                  ticks: {
                    stepSize: 1,
                    color: chartTheme.tick,
                  },
                  title: {
                    display: true,
                    text: `Minutes`,
                    color: chartTheme.tick,
                  },
                },
                y: {
                  grid: { color: chartTheme.grid },
                  title: {
                    display: true,
                    text:
                      lineShort === 'Bus' ? 'Buses' : lineShort === 'Ferry' ? 'Ferries' : 'Trains',
                    color: chartTheme.tick,
                  },
                  ticks: {
                    color: chartTheme.tick,
                  },
                },
              },
              // @ts-expect-error The watermark plugin doesn't have typescript support
              watermark: watermarkLayout(isMobile),
              plugins: {
                tooltip: {
                  mode: 'index',
                  callbacks: {
                    hoverCard: ([item]) => {
                      const x = item?.parsed.x;
                      if (!x) return null;
                      const [vehicle, vehicles] =
                        lineShort === 'Bus'
                          ? ['bus', 'buses']
                          : lineShort === 'Ferry'
                            ? ['ferry', 'ferries']
                            : ['train', 'trains'];
                      const count = item.parsed.y ?? 0;
                      const { pct_trains } = headwayBucketPercentages[x.toString()];
                      return {
                        title: `${x - 0.5}–${x + 0.5} min headways`,
                        hero: {
                          value: count.toLocaleString(),
                          unit: count === 1 ? vehicle : vehicles,
                          color: LINE_COLORS[line ?? 'default'],
                        },
                        meter: {
                          fraction: pct_trains / 100,
                          label: `${pct_trains}% of ${vehicles}`,
                          color: LINE_COLORS[line ?? 'default'],
                        },
                        rows:
                          !Number.isNaN(benchmarkTime) && benchmarkTime > 0
                            ? [
                                {
                                  label: 'Benchmark headway',
                                  value: getFormattedTimeString(benchmarkTime, 'seconds'),
                                  color: CHART_COLORS.ANNOTATIONS,
                                },
                              ]
                            : [],
                      };
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
            plugins={[ChartjsPluginWatermark]}
          />
        </ChartDiv>
        {!fill && (
          <div className="-mr-2.5 flex flex-row justify-end">
            <TripEmbedButton chart="headway-distribution" />
          </div>
        )}
      </ChartStack>
    );
  }, [
    fill,
    dataObject,
    isMobile,
    line,
    linePath,
    lineShort,
    benchmarkTime,
    headwayBucketPercentages,
    chartTheme,
  ]);
  return histogram;
};
