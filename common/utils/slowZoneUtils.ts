import timezone from 'dayjs/plugin/timezone';
import dayjs from 'dayjs';
import { enUS } from 'date-fns/locale';
import type { TimeUnit } from 'chart.js';
import utc from 'dayjs/plugin/utc';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useMemo } from 'react';
import type { Station } from '../types/stations';
import type { DayDelayTotals, Direction, SlowZone, SlowZoneResponse } from '../types/dataPoints';
import { TODAY_MIDNIGHT } from '../constants/dates';
import type { LineShort } from '../types/lines';
import { getParentStationForStopId } from './stations';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

dayjs.extend(timezone);

const getDirection = (to: Station, from: Station) => {
  const toOrder = to.order;
  const fromOrder = from.order;
  return toOrder > fromOrder ? 'southbound' : 'northbound';
};

// Data formatting & cleanup
const formatSlowZones = (data: SlowZoneResponse[]): SlowZone[] =>
  data.map((sz) => {
    // This will never be undefined unless there is a new station that we don't have in our const file
    const from = getParentStationForStopId(sz.fr_id);
    const to = getParentStationForStopId(sz.to_id);
    const direction = getDirection(to, from);
    return {
      order: from.order,
      start: sz.start,
      end: sz.end,
      id: from.station + '-' + to.station,
      from: from,
      to: to,
      title: `${from.short ?? from.stop_name}-${to.short ?? to.stop_name}`,
      delay: sz.delay,
      latest_delay: sz.latest_delay,
      duration: sz.duration,
      color: sz.color,
      direction,
    };
  });

export const getStationPairName = (from: Station, to: Station, short?: boolean): string => {
  if (short) return `${from.short ?? from.stop_name}-${to.short ?? to.stop_name}`;
  return `${from.stop_name}-${to.stop_name}`;
};

const groupByLine = (data: SlowZone[]) =>
  data.reduce((series: Record<string, SlowZone[]>, sz) => {
    const key = sz.color;
    const s = (series[key] || []).concat(sz);
    series[key] = s;
    return series;
  }, {});

export const formatSegments = (
  data: SlowZoneResponse[],
  startDateUTC: dayjs.Dayjs,
  direction: Direction
) => {
  if (!data) return [];

  const filteredData = data.filter((item) => {
    const szDate = dayjs.utc(item.end);
    return szDate.isAfter(startDateUTC);
  });

  return formatSlowZones(filteredData).filter((sz) => sz.direction === direction);
};

export const useFormatSegments = (
  data: SlowZoneResponse[],
  startDateUTC: dayjs.Dayjs,
  direction: Direction
) =>
  useMemo(() => {
    return formatSegments(data, startDateUTC, direction);
  }, [data, startDateUTC, direction]);

export const getRoutes = (direction: Direction, data: SlowZone[], isMobile: boolean) => {
  // group by line, sort by order , flatten, get ids, filter out duplicates
  const routes = Object.values(groupByLine(data))
    .map((sz: SlowZone[]) =>
      sz.sort((a, b) => (direction === 'southbound' ? a.order - b.order : b.order - a.order))
    )
    .flat()
    .map((sz: SlowZone) => getStationPairName(sz.from, sz.to, isMobile));
  return [...new Set(routes)];
};

export const getSlowZoneDelayDelta = (
  totals: DayDelayTotals[],
  lineShort: Exclude<LineShort, 'Bus' | 'Mattapan' | 'Commuter Rail'>
) => {
  if (!totals.length) return 0;
  return totals[totals.length - 1][lineShort] - totals[0][lineShort];
};

export const filterAllSlow = (
  data: SlowZoneResponse[],
  startDateUTC: dayjs.Dayjs,
  endDateUTC: dayjs.Dayjs,
  lineShort?: LineShort
) => {
  if (!data) return [];

  return data.filter((item) => {
    const start = dayjs.utc(item.start);
    const end = dayjs.utc(item.end);
    const isWithinDateRange =
      (start.isAfter(startDateUTC) || end.isAfter(startDateUTC)) && start.isBefore(endDateUTC);

    return (lineShort ? item.color === lineShort : true) && isWithinDateRange;
  });
};

export const useFilteredAllSlow = (
  data: SlowZoneResponse[],
  startDateUTC: dayjs.Dayjs,
  endDateUTC: dayjs.Dayjs,
  lineShort?: LineShort
) =>
  useMemo(() => {
    return filterAllSlow(data, startDateUTC, endDateUTC, lineShort);
  }, [data, startDateUTC, endDateUTC, lineShort]);

export const useFilteredDelayTotals = (
  data: DayDelayTotals[],
  startDateUTC: dayjs.Dayjs,
  endDateUTC: dayjs.Dayjs
) => {
  return useMemo(() => {
    return data.filter((t) => {
      const date = dayjs.utc(t.date);
      return date.isSameOrAfter(startDateUTC) && date.isSameOrBefore(endDateUTC);
    });
  }, [data, startDateUTC, endDateUTC]);
};

export const useSlowZoneQuantityDelta = (
  allSlow: SlowZone[],
  endDateUTC: dayjs.Dayjs,
  startDateUTC: dayjs.Dayjs
) => {
  return useMemo(() => {
    const start =
      allSlow.filter((sz) => {
        return dayjs.utc(sz.start).isSameOrBefore(startDateUTC);
      }).length ?? 0;
    const end =
      allSlow.filter((sz) => {
        const zoneEnd = dayjs.utc(sz.end);
        if (endDateUTC.isSame(TODAY_MIDNIGHT, 'day')) {
          // Our latest SZ data is always 1 day behind. So use yesterday's data.
          return zoneEnd.isSameOrAfter(endDateUTC.subtract(1, 'day'));
        }
        return zoneEnd.isSameOrAfter(endDateUTC);
      }).length ?? 0;

    return { endValue: end, zonesDelta: end - start };
  }, [allSlow, startDateUTC, endDateUTC]);
};

export const getTimeUnitSlowzones = (startDate: dayjs.Dayjs, endDate: dayjs.Dayjs): TimeUnit => {
  if (endDate.diff(startDate, 'day') < 60) return 'day';
  if (endDate.diff(startDate, 'year') < 3) return 'month';
  return 'year';
};

export const getSlowZoneOpacity = (delay: number) => {
  return Math.min(Math.sqrt(delay / 240), 0.9);
};

export const getDateAxisConfig = (startDateUTC: dayjs.Dayjs, endDateUTC: dayjs.Dayjs) => {
  return {
    min: startDateUTC.toISOString(),
    max: endDateUTC.toISOString(),
    time: { unit: getTimeUnitSlowzones(startDateUTC, endDateUTC) },
    adapters: {
      date: {
        locale: enUS,
      },
    },
    display: true,
    offset: true,
  };
};
