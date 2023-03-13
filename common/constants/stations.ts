import type { LineShort } from '../types/lines';
import type { LineMap } from '../types/stations';
import stations_json from './stations.json';
import bus_1 from './bus_constants/1.json';
import bus_15 from './bus_constants/15.json';
import bus_22 from './bus_constants/22.json';
import bus_23 from './bus_constants/23.json';
import bus_28 from './bus_constants/28.json';
import bus_32 from './bus_constants/32.json';
import bus_39 from './bus_constants/39.json';
import bus_57 from './bus_constants/57.json';
import bus_66 from './bus_constants/66.json';
import bus_71 from './bus_constants/71.json';
import bus_73 from './bus_constants/73.json';
import bus_77 from './bus_constants/77.json';
import bus_111 from './bus_constants/111.json';
import bus_114_116_117 from './bus_constants/114-116-117.json';

export const rtStations: { [key in Exclude<LineShort, 'Bus'>]: LineMap } = stations_json;

export const busStations: { [key: string]: LineMap } = {
  ...bus_1,
  ...bus_15,
  ...bus_22,
  ...bus_23,
  ...bus_28,
  ...bus_32,
  ...bus_39,
  ...bus_57,
  ...bus_66,
  ...bus_71,
  ...bus_73,
  ...bus_77,
  ...bus_111,
  ...bus_114_116_117,
};

export const stations = { ...rtStations, Bus: busStations };

export const getBusLines = (): string[] => {
  return Object.keys(busStations);
};
