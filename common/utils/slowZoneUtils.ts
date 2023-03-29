import timezone from 'dayjs/plugin/timezone';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import type { Station } from '../../common/types/stations';
import type {
  DayDelayTotals,
  Direction,
  SlowZone,
  SlowZoneResponse,
} from '../../common/types/dataPoints';
import { TODAY_UTC } from '../components/inputs/DateSelection/DateConstants';
import { lookup_station_by_id } from './stations';

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
export const formatSlowZones = (data: SlowZoneResponse[]): SlowZone[] =>
  data.map((x) => {
    // This will never be undefined unless there is a new station that we don't have in our const file
    const from = lookup_station_by_id(x.color, x.fr_id) as Station;
    const to = lookup_station_by_id(x.color, x.to_id) as Station;
    const direction = getDirection(to, from);
    return {
      order: from.order,
      start: x.start,
      end: x.end,
      from: from.stop_name,
      to: to.stop_name,
      id: from.stop_name + '-' + to.stop_name,
      delay: +x.delay,
      duration: +x.duration,
      color: x.color,
      fr_id: x.fr_id,
      to_id: x.to_id,
      direction,
    };
  });

export const groupByRoute = (data: SlowZone[]) =>
  data.reduce((series: Record<string, SlowZone[]>, sz: SlowZone) => {
    const key = sz.id;
    const s = (series[key] || []).concat(sz);
    series[key] = s;
    return series;
  }, {});

export const groupByLine = (data: SlowZone[]) =>
  data.reduce((series: Record<string, SlowZone[]>, sz) => {
    const key = sz.color;
    const s = (series[key] || []).concat(sz);
    series[key] = s;
    return series;
  }, {});

export const getRoutes = (data: SlowZone[], direction: Direction) => {
  // group by line, sort by order , flatten, get ids, filter out duplicates
  const routes = Object.values(groupByLine(data))
    .map((sz: SlowZone[]) =>
      sz.sort((a, b) => (direction === 'southbound' ? a.order - b.order : b.order - a.order))
    )
    .flat()
    .map((sz: SlowZone) => sz.id);
  return [...new Set(routes)];
};

export const getSlowZoneDelayDelta = ({
  totals,
  lineShort,
}: {
  lineShort?: string;
  totals?: DayDelayTotals[];
}) => {
  return totals?.length && lineShort
    ? totals[totals.length - 1][lineShort] - totals[0][lineShort]
    : undefined;
};

const getSlowZoneQuantityDelta = ({
  allSlow,
  startDateUTC,
  endDateUTC,
}: {
  allSlow?: SlowZoneResponse[];
  startDateUTC?: dayjs.Dayjs;
  endDateUTC: dayjs.Dayjs;
}) => {
  const zonesStart =
    allSlow?.filter((sz) => {
      const zoneStart = dayjs.utc(sz.start);
      return zoneStart.isSameOrBefore(startDateUTC);
    }).length ?? null;
  const zonesEnd =
    allSlow?.filter((sz) => {
      const zoneEnd = dayjs.utc(sz.end);
      if (endDateUTC.isSame(TODAY_UTC, 'day')) {
        // Our latest SZ data is always 1 day behind
        return zoneEnd.isSameOrAfter(endDateUTC.subtract(1, 'day'));
      }
      return zoneEnd.isSameOrAfter(endDateUTC);
    }).length ?? null;

  return zonesEnd != undefined && zonesStart != undefined ? zonesEnd - zonesStart : undefined;
};

export const getSlowZoneDeltas = ({
  lineShort,
  totals,
  allSlow,
  startDateUTC,
  endDateUTC,
}: {
  lineShort?: string;
  totals?: DayDelayTotals[];
  allSlow?: SlowZoneResponse[];
  startDateUTC?: dayjs.Dayjs;
  endDateUTC: dayjs.Dayjs;
}): { zonesDelta: number | undefined; delayDelta: undefined | number } => {
  const zonesDelta = allSlow
    ? getSlowZoneQuantityDelta({ allSlow, startDateUTC, endDateUTC })
    : undefined;
  const delayDelta = totals ? getSlowZoneDelayDelta({ totals, lineShort }) : undefined;
  return {
    zonesDelta,
    delayDelta,
  };
};
