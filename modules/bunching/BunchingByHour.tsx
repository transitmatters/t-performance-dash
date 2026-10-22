import { Bar } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import React, { useMemo, useRef } from 'react';
import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import { useDelimitatedRoute } from '../../common/utils/router';
import { COLORS } from '../../common/constants/colors';
import type { SingleDayDataPoint } from '../../common/types/charts';
import { MetricFieldKeys, BenchmarkFieldKeys } from '../../common/types/charts';
import type { Station } from '../../common/types/stations';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { watermarkLayout } from '../../common/constants/charts';
import { ChartDiv } from '../../common/components/charts/ChartDiv';
import { ChartBorder } from '../../common/components/charts/ChartBorder';

interface BunchingByHourProps {
  headways: SingleDayDataPoint[];
  fromStation: Station;
  toStation: Station;
}

interface HourlyBunchingData {
  hour: number;
  bunched: number;
  onTime: number;
  gapped: number;
  total: number;
}

// Muted colors for bunching chart - softer palette that's easier on the eyes
const BUNCHING_COLORS = {
  bunched: '#d98c9b', // muted rose/salmon
  onTime: '#8fbf91', // muted sage green
  gapped: '#e6c87d', // muted golden/amber
};

const classifyHeadway = (
  headwayTimeSec: number | undefined,
  benchmarkTimeSec: number | null | undefined
): 'bunched' | 'onTime' | 'gapped' | 'unknown' => {
  if (
    headwayTimeSec === undefined ||
    benchmarkTimeSec === undefined ||
    benchmarkTimeSec === null ||
    benchmarkTimeSec === 0
  ) {
    return 'unknown';
  }
  const ratio = headwayTimeSec / benchmarkTimeSec;
  if (ratio <= 0.5) return 'bunched';
  if (ratio > 0.75 && ratio < 1.25) return 'onTime';
  if (ratio >= 1.25) return 'gapped';
  return 'onTime'; // Between 0.5 and 0.75 - slightly early but not bunched
};

const getHourFromDepDt = (depDt: string | undefined): number | null => {
  if (!depDt) return null;
  const date = new Date(depDt);
  return date.getHours();
};

// Service day ordering: 4am-3am (hours 0-3 come after hour 23)
const SERVICE_DAY_START_HOUR = 4;
const getServiceDayOrder = (hour: number): number => {
  if (hour < SERVICE_DAY_START_HOUR) {
    return hour + 24; // 0->24, 1->25, 2->26, 3->27
  }
  return hour;
};

export const BunchingByHour: React.FC<BunchingByHourProps> = ({ headways }) => {
  const { linePath, lineShort } = useDelimitatedRoute();

  const ref = useRef();
  const isMobile = !useBreakpoint('md');

  const hourlyData: HourlyBunchingData[] = useMemo(() => {
    // Initialize all hours
    const hourBuckets: Record<number, HourlyBunchingData> = {};
    for (let h = 0; h < 24; h++) {
      hourBuckets[h] = { hour: h, bunched: 0, onTime: 0, gapped: 0, total: 0 };
    }

    // Classify and bucket each headway
    headways.forEach((point) => {
      const hour = getHourFromDepDt(point.current_dep_dt);
      if (hour === null) return;

      const classification = classifyHeadway(
        point[MetricFieldKeys.headwayTimeSec],
        point[BenchmarkFieldKeys.benchmarkHeadwayTimeSec]
      );

      if (classification === 'unknown') return;

      hourBuckets[hour][classification]++;
      hourBuckets[hour].total++;
    });

    // Filter to hours with data and sort by service day order (4am-3am)
    return Object.values(hourBuckets)
      .filter((h) => h.total > 0)
      .sort((a, b) => getServiceDayOrder(a.hour) - getServiceDayOrder(b.hour));
  }, [headways]);

  const chartData = useMemo(() => {
    const labels = hourlyData.map((h) => {
      const { hour } = h;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}${ampm}`;
    });

    return {
      labels,
      datasets: [
        {
          label: 'On Time',
          data: hourlyData.map((h) => (h.onTime / h.total) * 100),
          backgroundColor: BUNCHING_COLORS.onTime,
          stack: 'stack0',
        },
        {
          label: 'Gapped',
          data: hourlyData.map((h) => (h.gapped / h.total) * 100),
          backgroundColor: BUNCHING_COLORS.gapped,
          stack: 'stack0',
        },
        {
          label: 'Bunched',
          data: hourlyData.map((h) => (h.bunched / h.total) * 100),
          backgroundColor: BUNCHING_COLORS.bunched,
          stack: 'stack0',
        },
      ],
    };
  }, [hourlyData]);

  if (hourlyData.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center text-stone-400">
        No headway data with benchmark available
      </div>
    );
  }

  return (
    <ChartBorder>
      <ChartDiv isMobile={isMobile}>
        <Bar
          id={`bunching-by-hour-${linePath}`}
          ref={ref}
          height={isMobile ? 200 : 240}
          redraw={true}
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                stacked: true,
                ticks: {
                  color: COLORS.design.subtitleGrey,
                  maxRotation: 45,
                  minRotation: 0,
                },
                title: {
                  display: true,
                  text: 'Hour',
                  color: COLORS.design.subtitleGrey,
                },
              },
              y: {
                stacked: true,
                min: 0,
                max: 100,
                title: {
                  display: true,
                  text: '% of trips',
                  color: COLORS.design.subtitleGrey,
                },
                ticks: {
                  color: COLORS.design.subtitleGrey,
                  callback: (value) => `${value}%`,
                },
              },
            },
            // @ts-expect-error The watermark plugin doesn't have typescript support
            watermark: watermarkLayout(isMobile),
            plugins: {
              tooltip: {
                mode: 'index',
                callbacks: {
                  label: (context) => {
                    const value = context.parsed.y;
                    const datasetLabel = context.dataset.label;
                    const hourIndex = context.dataIndex;
                    const hourData = hourlyData[hourIndex];
                    const count =
                      datasetLabel === 'Bunched'
                        ? hourData.bunched
                        : datasetLabel === 'On Time'
                          ? hourData.onTime
                          : hourData.gapped;
                    const vehicleType =
                      lineShort === 'Bus' ? 'buses' : lineShort === 'Ferry' ? 'ferries' : 'trains';
                    return `${datasetLabel}: ${value.toFixed(1)}% (${count} ${vehicleType})`;
                  },
                  footer: (tooltipItems) => {
                    if (tooltipItems.length === 0) return '';
                    const hourIndex = tooltipItems[0].dataIndex;
                    const hourData = hourlyData[hourIndex];
                    const vehicleType =
                      lineShort === 'Bus' ? 'buses' : lineShort === 'Ferry' ? 'ferries' : 'trains';
                    return `Total: ${hourData.total} ${vehicleType}`;
                  },
                },
              },
              legend: {
                display: false,
              },
            },
            interaction: {
              mode: 'index',
              intersect: false,
            },
          }}
          plugins={[ChartjsPluginWatermark]}
        />
      </ChartDiv>
      <BunchingLegend />
    </ChartBorder>
  );
};

const BunchingLegend: React.FC = () => {
  return (
    <div className="flex w-full flex-row items-baseline justify-center gap-4 p-2 text-left text-xs text-stone-600 sm:gap-6">
      <p className="flex items-center">
        <span
          className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm"
          style={{ backgroundColor: BUNCHING_COLORS.onTime }}
        />
        On Time
      </p>
      <p className="flex items-center">
        <span
          className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm"
          style={{ backgroundColor: BUNCHING_COLORS.gapped }}
        />
        Gapped
      </p>
      <p className="flex items-center">
        <span
          className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm"
          style={{ backgroundColor: BUNCHING_COLORS.bunched }}
        />
        Bunched
      </p>
    </div>
  );
};
