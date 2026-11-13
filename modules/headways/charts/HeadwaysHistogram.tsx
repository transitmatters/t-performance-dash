import { Bar } from '@chartjs-components';
import 'chartjs-adapter-date-fns';
import { useMemo, useRef } from 'react';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { CHART_COLORS, LINE_COLORS } from '../../../common/constants/colors';
import type { HeadwaysChartProps } from '../../../common/types/charts';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import { useChartTheme } from '../../../common/utils/chartTheme';
import { ChartDiv } from '../../../common/components/charts/ChartDiv';
import { ChartStack } from '../../../common/components/charts/ChartStack';
import { ChartActions } from '../../../common/components/charts/ChartActions';
import { getLocationDetails } from '../../../common/utils/stations';
import { getFormattedTimeString } from '../../../common/utils/time';
import { TripEmbedButton } from '../../tripexplorer/TripEmbedButton';
import { getHeadwayBuckets } from './utils';

export const HeadwaysHistogram = ({
  headways,
  fromStation,
  toStation,
  date: dateProp,
  fill = false,
}: HeadwaysChartProps) => {
  const { colorKey, linePath, lineShort, query } = useDelimitatedRoute();
  const date = dateProp ?? query.date;

  const ref = useRef(null);
  const chartTheme = useChartTheme();
  const isMobile = !useBreakpoint('md');

  const buckets = useMemo(() => getHeadwayBuckets(headways), [headways]);
  const dataObject = useMemo(
    () => Object.fromEntries(Object.entries(buckets).map(([key, { count }]) => [key, count])),
    [buckets]
  );

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
                  backgroundColor: LINE_COLORS[colorKey ?? 'default'],
                  borderRadius: 4,
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
                  min: 0,
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
                      const { pctTrips, benchmark } = buckets[x.toString()];
                      return {
                        title: `${x - 0.5}–${x + 0.5} min headways`,
                        hero: {
                          value: count.toLocaleString(),
                          unit: count === 1 ? vehicle : vehicles,
                          color: LINE_COLORS[colorKey ?? 'default'],
                        },
                        meter: {
                          fraction: pctTrips / 100,
                          label: `${pctTrips}% of ${vehicles}`,
                          color: LINE_COLORS[colorKey ?? 'default'],
                        },
                        rows: benchmark
                          ? [
                              {
                                label: 'Benchmark headway',
                                value: getFormattedTimeString(benchmark.median),
                                detail:
                                  benchmark.min !== benchmark.max
                                    ? `${getFormattedTimeString(benchmark.min)}–${getFormattedTimeString(benchmark.max)}`
                                    : undefined,
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
          />
        </ChartDiv>
        <ChartActions
          datasetName="headway-distribution"
          chartRef={ref}
          location={getLocationDetails(fromStation, toStation)}
          startDate={date}
          embed={<TripEmbedButton page="single" chart="headway-distribution" />}
        />
      </ChartStack>
    );
  }, [
    fill,
    dataObject,
    isMobile,
    colorKey,
    linePath,
    lineShort,
    buckets,
    chartTheme,
    fromStation,
    toStation,
    date,
  ]);
  return histogram;
};
