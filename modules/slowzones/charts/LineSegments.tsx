import type { CartesianScaleTypeRegistry, ScaleOptionsByType } from 'chart.js';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { enUS } from 'date-fns/locale';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import React, { useMemo, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { YESTERDAY_MIDNIGHT } from '../../../common/constants/dates';
import { COLORS } from '../../../common/constants/colors';
import type { Direction, LineSegmentData, SlowZone } from '../../../common/types/dataPoints';
import type { LineShort } from '../../../common/types/lines';
import { getRoutes, getStationPairName } from '../../../common/utils/slowZoneUtils';
import { getSlowZoneOpacity } from '../map/SlowZonesMap';
import { hexWithAlpha } from '../../../common/utils/general';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, TimeScale);

interface LineSegmentsProps {
  data: SlowZone[];
  line: LineShort;
  startDateUTC: dayjs.Dayjs;
  endDateUTC: dayjs.Dayjs;
  direction: Direction;
}

export const LineSegments: React.FC<LineSegmentsProps> = ({
  data,
  line,
  startDateUTC,
  endDateUTC,
  direction,
}) => {
  const ref = useRef();
  const chartRange = endDateUTC.diff(startDateUTC, 'day');
  const breakpoint = [
    { active: useBreakpoint('xl'), value: chartRange / 36 },
    { active: useBreakpoint('lg'), value: chartRange / 20 },
    { active: useBreakpoint('md'), value: chartRange / 12 },
    { active: useBreakpoint('sm'), value: chartRange / 12 },
  ];
  const shortNames = !breakpoint[1].active;
  const getDisplayCutoff = () => {
    for (const bp of breakpoint) {
      if (bp.active) return bp.value;
    }
    return chartRange / 20;
  };

  const isMobile = !breakpoint[3].active;
  const routes = useMemo(
    () => getRoutes(direction, data, shortNames),
    [data, direction, shortNames]
  );

  const dateAxisConfig: ScaleOptionsByType<keyof CartesianScaleTypeRegistry> = {
    min: startDateUTC.toISOString(),
    max: endDateUTC.toISOString(),
    type: 'time',
    time: {
      unit: 'day',
    },
    adapters: {
      date: {
        locale: enUS,
      },
    },
    display: true,
  };
  const stationAxisConfig: ScaleOptionsByType<keyof CartesianScaleTypeRegistry> = {
    position: 'top',
    stacked: true,
    beginAtZero: true,
    ticks: {
      autoSkip: false,
      maxRotation: isMobile ? 20 : 0,
      minRotation: isMobile ? 20 : 0,
    },
  };

  const lineSegmentData: LineSegmentData[] = data.map((sz) => {
    const szStartDate = dayjs.utc(sz.start);
    const szEndDate = dayjs.utc(sz.end);
    return {
      duration: szEndDate.diff(szStartDate, 'day'),
      x: [szStartDate.format('YYYY-MM-DD'), szEndDate.format('YYYY-MM-DD')],
      y: [szStartDate.format('YYYY-MM-DD'), szEndDate.format('YYYY-MM-DD')],
      id: getStationPairName(sz.from, sz.to, shortNames),
      delay: sz.delay,
    };
  });

  return (
    <Bar
      ref={ref}
      id={'timeline-slow-zones'}
      data={{
        labels: routes,
        datasets: [
          {
            borderWidth: 2,
            borderRadius: 4,

            borderColor: line && COLORS.mbta[line.toLowerCase()],
            backgroundColor: (context) => {
              const index = context.dataIndex;
              return hexWithAlpha(
                line && COLORS.mbta[line.toLowerCase()],
                getSlowZoneOpacity(lineSegmentData[index]?.delay)
              );
            },
            label: line,
            borderSkipped: false,
            data: lineSegmentData,
          },
        ],
      }}
      plugins={[ChartDataLabels]}
      options={{
        maintainAspectRatio: false,
        responsive: true,

        layout: {
          padding: {},
        },

        parsing: isMobile
          ? { xAxisKey: 'id' }
          : {
              yAxisKey: 'id',
            },
        indexAxis: isMobile ? 'x' : 'y',
        scales: {
          y: isMobile ? dateAxisConfig : stationAxisConfig,
          x: isMobile ? stationAxisConfig : dateAxisConfig,
        },

        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return 'Delay: ' + data[context.dataIndex].delay.toFixed(0) + ' sec';
              },
              title: (context) => {
                return getStationPairName(
                  data[context[0].dataIndex].from,
                  data[context[0].dataIndex].to
                );
              },
              beforeBody: (context) => {
                const start = context[0].parsed._custom?.barStart;
                const end = context[0].parsed._custom?.barEnd;
                if (!(start && end)) return 'Unknown dates';
                const startUTC = dayjs.utc(start);
                const endUTC = dayjs.utc(end);
                return `${startUTC.format('MMM D, YYYY')} - ${
                  dayjs.utc(endUTC).isSame(YESTERDAY_MIDNIGHT)
                    ? 'Ongoing'
                    : dayjs(endUTC).format('MMM D, YYYY')
                }`;
              },
            },
          },
          datalabels: {
            anchor: 'center',
            clamp: true,
            clip: false,
            formatter: (context) => {
              return context.delay.toFixed(0) + ' s';
            },
            display: (context) => lineSegmentData[context.dataIndex].duration > getDisplayCutoff(),

            labels: {
              value: {
                backgroundColor: hexWithAlpha(line && COLORS.mbta[line.toLowerCase()], 0.8),
                borderRadius: 4,
                color: '#ffffff',
              },
            },
          },
        },
      }}
    />
  );
};
