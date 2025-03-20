import 'chartjs-adapter-date-fns';
import { Bar } from 'react-chartjs-2';
import React, { useMemo, useRef } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import minMax from 'dayjs/plugin/minMax';
import ChartjsPluginWatermark from 'chartjs-plugin-watermark';

import type { ChartDataset } from 'chart.js';
import {
  DATE_FORMAT,
  YESTERDAY_MIDNIGHT,
  YESTERDAY_STRING,
  TODAY,
} from '../../../common/constants/dates';
import { COLORS } from '../../../common/constants/colors';
import type { Direction, LineSegmentData, SlowZone } from '../../../common/types/dataPoints';
import type { LinePath } from '../../../common/types/lines';
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
dayjs.extend(minMax);

interface LineSegmentsProps {
  data: SlowZone[];
  linePath?: LinePath;
  startDateUTC: dayjs.Dayjs;
  endDateUTC: dayjs.Dayjs;
  direction: Direction;
}

export const LineSegments: React.FC<LineSegmentsProps> = ({
  data,
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
      latest_delay: sz.latest_delay,
      stations: stopIdsForStations(sz.from, sz.to),
      color: sz.color,
    };
  });

  const groupDataByColor = (data: LineSegmentData[]) => {
    return data.reduce((groups: Record<string, LineSegmentData[]>, item) => {
      const group = item.color;
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(item);
      return groups;
    }, {});
  };

  const lineSegmentDataByColor = useMemo(
    () => groupDataByColor(lineSegmentData),
    [lineSegmentData]
  );

  return (
    <Bar
      ref={ref}
      id={`timeline-slow-zones-${linePath}`}
      data={{
        labels: routes,
        datasets: Object.entries(lineSegmentDataByColor).map(
          ([color, data]: [string, LineSegmentData[]]) => {
            const datasetObject: ChartDataset<'bar', LineSegmentData[]> = {
              borderWidth: 2,
              borderColor: COLORS.mbta[color.toLowerCase() as keyof typeof COLORS.mbta],
              backgroundColor: (context) => {
                return hexWithAlpha(
                  COLORS.mbta[color.toLowerCase() as keyof typeof COLORS.mbta],
                  getSlowZoneOpacity(data[context.dataIndex]?.delay)
                );
              },
              label: color,
              borderSkipped: false,
              data,
            };

            // If we're in system mode
            if (Object.entries(lineSegmentDataByColor).length > 1) {
              datasetObject.barPercentage = 50;
              datasetObject.categoryPercentage = 0.05;
            }

            return datasetObject;
          }
        ),
      }}
      plugins={[ChartjsPluginWatermark]}
      options={{
        maintainAspectRatio: false,
        responsive: true,
        onClick: (event, elements) => {
          if (elements.length >= 1) {
            const { color, x, stations } = elements[0].element['$context'].raw as LineSegmentData;
            const hrefPathname = `/${color.toLowerCase()}${ALL_PAGES.multiTrips.path}`;
            const queryParams: QueryParams = {
              // Show 7 days before slowzone start for comparison
              startDate: dayjs(x[0]).subtract(7, 'days').format(DATE_FORMAT),
              endDate: dayjs.min(TODAY, dayjs(x[1]).add(7, 'days'))?.format(DATE_FORMAT),
              to: stations.toStopIds?.[0],
              from: stations.fromStopIds?.[0],
            };
            const params = new URLSearchParams(queryParams);
            window.open(`${hrefPathname}/?${params.toString()}`, '_blank', 'noreferrer');
          }
        },
        onHover: (event, elements) => {
          // @ts-expect-error TS doesn't think target has `style` (rude), but it does
          event.native.target.style.cursor = elements?.[0] ? 'pointer' : 'default';
        },
        parsing: isMobile ? { xAxisKey: 'id' } : { yAxisKey: 'id' },
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
                const slowzone = context.raw as LineSegmentData;
                const delays = [` Average Delay: ${slowzone.delay.toFixed(0)} sec.`];

                if (slowzone.latest_delay !== null) {
                  delays.push(` Latest Delay: ${slowzone.latest_delay.toFixed(0)} sec`);
                }
                return delays;
              },
              title: (context) => {
                return context[0].label;
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
          annotation: {
            // TODO: This doesn't work properly when switching screen sizes without a refresh.
            annotations: {
              today: {
                type: 'line',
                xMin: isMobile ? undefined : YESTERDAY_STRING,
                yMin: isMobile ? YESTERDAY_STRING : undefined,
                xMax: isMobile ? undefined : YESTERDAY_STRING,
                yMax: isMobile ? YESTERDAY_STRING : undefined,
                borderWidth: 1,
                borderColor: '#10101030',
                borderDash: [5, 5],
                label: {
                  display: true,
                },
              },
            },
          },
        },
      }}
    />
  );
};
