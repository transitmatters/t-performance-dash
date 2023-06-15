import 'chartjs-adapter-date-fns';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';
import React, { useMemo, useRef } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { YESTERDAY_MIDNIGHT } from '../../../common/constants/dates';
import { COLORS } from '../../../common/constants/colors';
import type { Direction, LineSegmentData, SlowZone } from '../../../common/types/dataPoints';
import type { LinePath, LineShort } from '../../../common/types/lines';
import {
  getRoutes,
  getSlowZoneOpacity,
  getStationPairName,
  getDateAxisConfig,
} from '../../../common/utils/slowZoneUtils';
import { hexWithAlpha } from '../../../common/utils/general';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import { stationAxisConfig } from '../constants/chartConfig';
import { watermarkLayout } from '../../../common/constants/charts';
import { stopIdsForStations } from '../../../common/utils/stations';
import { ALL_PAGES } from '../../../common/constants/pages';
import type { QueryParams } from '../../../common/types/router';
dayjs.extend(utc);

interface LineSegmentsProps {
  data: SlowZone[];
  line: LineShort;
  linePath: LinePath;
  startDateUTC: dayjs.Dayjs;
  endDateUTC: dayjs.Dayjs;
  direction: Direction;
}

export const LineSegments: React.FC<LineSegmentsProps> = ({
  data,
  line,
  linePath,
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
  const useShortStationNames = !breakpoint[1].active;
  const getDisplayCutoff = () => {
    for (const bp of breakpoint) {
      if (bp.active) return bp.value;
    }
    return chartRange / 20;
  };

  const isMobile = !breakpoint[3].active;
  const routes = useMemo(
    () => getRoutes(direction, data, useShortStationNames),
    [data, direction, useShortStationNames]
  );

  const lineSegmentData: LineSegmentData[] = data.map((sz) => {
    const szStartDate = dayjs.utc(sz.start);
    const szEndDate = dayjs.utc(sz.end);
    const szTimePeriod = [szStartDate.format('YYYY-MM-DD'), szEndDate.format('YYYY-MM-DD')];
    return {
      duration: szEndDate.diff(szStartDate, 'day'),
      x: szTimePeriod,
      y: szTimePeriod,
      id: getStationPairName(sz.from, sz.to, useShortStationNames),
      delay: sz.delay,
      stations: stopIdsForStations(sz.from, sz.to),
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
              return hexWithAlpha(
                line && COLORS.mbta[line.toLowerCase()],
                getSlowZoneOpacity(lineSegmentData[context.dataIndex]?.delay)
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
        interaction: {
          intersect: true,
          mode: 'index',
        },
        onClick: (event, elements) => {
          if (elements.length >= 1) {
            const segment = elements[0].element['$context'].raw as LineSegmentData;
            const hrefPathname = `/${linePath}${ALL_PAGES.multiTrips.path}`;
            const queryParams: QueryParams = {
              startDate: segment.x[0],
              endDate: segment.x[1],
              to: segment.stations.toStopIds?.[0],
              from: segment.stations.fromStopIds?.[0],
            };
            const params = new URLSearchParams(queryParams);
            window.open(`${hrefPathname}?${params.toString()}`);
          }
        },
        onHover: (event, elements) => {
          // @ts-expect-error TS doesn't think target has `style` (rude), but it does
          event.native?.target.style.cursor = elements?.[0] ? 'pointer' : 'default';
        },
        parsing: isMobile
          ? { xAxisKey: 'id' }
          : {
              yAxisKey: 'id',
            },
        indexAxis: isMobile ? 'x' : 'y',
        scales: {
          x: isMobile
            ? stationAxisConfig
            : { ...getDateAxisConfig(startDateUTC, endDateUTC), type: 'time' },
          y: isMobile
            ? { ...getDateAxisConfig(startDateUTC, endDateUTC), type: 'time' }
            : stationAxisConfig,
        },
        // @ts-expect-error The watermark plugin doesn't have typescript support
        watermark: watermarkLayout(isMobile),
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
            padding: 2,
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
