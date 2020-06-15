import { stations } from './constants';

const all_lines = () => {
  return [...new Set(stations.map(station => station.line))];
};

const lookup_station_by_id = (id) => {
  return stations.filter(x => x.stop_id === id)[0];
};

const options_direction = (line) => {
  return [...new Set(stations.filter(station => station.line === line).map(station => station.direction))];
};

const options_station = (line) => {
  return stations.filter(x => x.line === line);
};

export {
  all_lines,
  options_direction,
  options_station,
  lookup_station_by_id,
};
