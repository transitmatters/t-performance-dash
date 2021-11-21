import { stations as rt_stations } from './constants';

import bus_1 from './bus_constants/1.json';
import bus_23 from './bus_constants/23.json';
import bus_28 from './bus_constants/28.json';
import bus_57 from './bus_constants/57.json';
import bus_66 from './bus_constants/66.json';
import bus_111 from './bus_constants/111.json';
import bus_114_116_117 from './bus_constants/114-116-117.json'

const stations = {...rt_stations,
                  ...bus_1,
                  ...bus_23,
                  ...bus_28,
                  ...bus_57,
                  ...bus_66,
                  ...bus_111,
                  ...bus_114_116_117
                };

const all_lines = () => {
  return Object.keys(stations);
};

const lookup_station_by_id = (line, id) => {
  if (line === "" || line === undefined || id === "" || id === undefined) {
    return undefined;
  }

  return stations[line].stations.find(x => [...x.stops["0"] || [], ...x.stops["1"] || []].includes(id));
};

const options_station = (line) => {
  if (!line) {
    return [];
  }
  return stations[line].stations;
};

const station_direction = (from, to, line) => {
  if (from.order === to.order) {
    return "";
  }
  return from.order > to.order ? stations[line].direction["0"] : stations[line].direction["1"];
}

const get_stop_ids_for_stations = (from, to) => {
  if (!from || !to) {
    return { fromStopId: null, toStopId: null };
  }
  const isDirection1 = from.order < to.order;
  return {
    fromStopIds: isDirection1 ? from.stops["1"] : from.stops["0"],
    toStopIds: isDirection1 ? to.stops["1"] : to.stops["0"],
  }
}

export {
  all_lines,
  options_station,
  station_direction,
  lookup_station_by_id,
  get_stop_ids_for_stations,
};
