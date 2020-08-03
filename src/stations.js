import { stations } from './constants';

const all_lines = () => {
  return Object.keys(stations);
};

const lookup_station_by_id = (line, id) => {
  return stations[line].find(x => [...x.stops.northbound, ...x.stops.southbound].includes(id));
};

const options_station = (line) => {
  if (!line) {
    return [];
  }
  return stations[line];
};

const station_direction = (from, to, line) => {
  if (from.order === to.order) {
    return "";
  }
  return from.order > to.order ? "northbound" : "southbound";
}

const get_stop_ids_for_stations = (from, to) => {
  if (!from || !to) {
    return { fromStopId: null, toStopId: null };
  }
  const isSouthbound = from.order < to.order;
  return {
    fromStopIds: isSouthbound ? from.stops.southbound : from.stops.northbound,
    toStopIds: isSouthbound ? to.stops.southbound : to.stops.northbound,
  }
}

export {
  all_lines,
  options_station,
  station_direction,
  lookup_station_by_id,
  get_stop_ids_for_stations,
};
