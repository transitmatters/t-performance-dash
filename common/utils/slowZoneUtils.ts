import type { Station } from '../../common/types/stations';
import type { Direction, SlowZone, SlowZoneResponse } from '../../common/types/dataPoints';
import { lookup_station_by_id } from './stations';

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
