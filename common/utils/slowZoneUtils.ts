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
import { DATE_FORMAT, TODAY_MIDNIGHT } from '../constants/dates';
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

/** The single most time-costly segment among currently-active slow zones, for headlining. */
export const getWorstSlowZoneSegment = (
  data: SlowZoneResponse[],
  startDateUTC: dayjs.Dayjs,
  endDateUTC: dayjs.Dayjs,
  lineShort: LineShort
): SlowZone | null => {
  const active = filterAllSlow(data, startDateUTC, endDateUTC, lineShort).filter(
    (sz) => sz.latest_delay !== null
  );
  if (!active.length) return null;
  const worst = active.reduce((max, sz) => (sz.delay > max.delay ? sz : max), active[0]);
  return formatSlowZones([worst])[0];
};

export const getSlowZoneDelayDelta = (
  totals: DayDelayTotals[],
  lineShort: Exclude<LineShort, 'Bus' | 'Commuter Rail'>
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

const sharesBranch = (station: Station, branches: string[] | null) =>
  !branches || !station.branches || station.branches.some((branch) => branches.includes(branch));

/** Whether a slow zone sits on the path from `from` to `to`, in the same direction. */
export const isZoneOnTrip = (
  zone: SlowZoneResponse,
  from: Station,
  to: Station,
  lineShort: LineShort
) => {
  if (zone.color !== lineShort) return false;
  const zoneFrom = getParentStationForStopId(zone.fr_id, lineShort);
  const zoneTo = getParentStationForStopId(zone.to_id, lineShort);
  if (!zoneFrom || !zoneTo) return false;
  if (Math.sign(zoneTo.order - zoneFrom.order) !== Math.sign(to.order - from.order)) return false;

  // Branch station orders restart in their own range (Red Braintree is 2xx, Green D is 3xx), so
  // an order range alone would pull in zones from the other branch.
  const tripBranches =
    from.branches && to.branches ? from.branches.filter((b) => to.branches?.includes(b)) : null;
  const low = Math.min(from.order, to.order);
  const high = Math.max(from.order, to.order);
  return [zoneFrom, zoneTo].every(
    (station) =>
      station.order >= low && station.order <= high && sharesBranch(station, tripBranches)
  );
};

export interface TripSlowZoneSummary {
  startDate: string;
  /** The requested end date, pulled back to the last day with slow zone data. */
  endDate: string;
  startTotal: number;
  endTotal: number;
  endZones: number;
  peakTotal: number;
  peakDate: string;
}

/**
 * Slow time on a trip for each day of a window, summing each active zone's median delay. Pass the
 * same start and end date for a single day. Returns null when no slow zone on the trip overlaps
 * the window.
 */
export const getTripSlowZoneSummary = (
  data: SlowZoneResponse[],
  from: Station,
  to: Station,
  lineShort: LineShort,
  startDate: string,
  endDate: string
): TripSlowZoneSummary | null => {
  const zones = data.map((zone) => ({
    ...zone,
    start: zone.start.slice(0, 10),
    end: zone.end.slice(0, 10),
  }));
  const lastDataDate = zones.reduce((max, zone) => (zone.end > max ? zone.end : max), '');
  const end = endDate > lastDataDate ? lastDataDate : endDate;
  const start = startDate > end ? end : startDate;

  const tripZones = zones.filter(
    (zone) => zone.start <= end && zone.end >= start && isZoneOnTrip(zone, from, to, lineShort)
  );
  if (!tripZones.length) return null;

  const activeOn = (date: string) =>
    tripZones.filter((zone) => zone.start <= date && zone.end >= date);
  const totalOn = (date: string) => activeOn(date).reduce((sum, zone) => sum + zone.delay, 0);

  let peakTotal = 0;
  let peakDate = start;
  for (let day = dayjs(start); !day.isAfter(end, 'day'); day = day.add(1, 'day')) {
    const date = day.format(DATE_FORMAT);
    const total = totalOn(date);
    if (total > peakTotal) {
      peakTotal = total;
      peakDate = date;
    }
  }
  if (peakTotal <= 0) return null;

  return {
    startDate: start,
    endDate: end,
    startTotal: totalOn(start),
    endTotal: totalOn(end),
    endZones: activeOn(end).length,
    peakTotal,
    peakDate,
  };
};
