/* eslint-disable import/max-dependencies */
import type { LineShort } from '../types/lines';
import type { LineMap } from '../types/stations';
import stations_json from './stations.json';
import bus_1 from './bus_constants/1.json';
import bus_4 from './bus_constants/4.json';
import bus_9 from './bus_constants/9.json';
import bus_10 from './bus_constants/10.json';
import bus_11 from './bus_constants/11.json';
import bus_14 from './bus_constants/14.json';
import bus_15 from './bus_constants/15.json';
import bus_16 from './bus_constants/16.json';
import bus_17_19 from './bus_constants/17-19.json';
import bus_18 from './bus_constants/18.json';
import bus_21 from './bus_constants/21.json';
import bus_22 from './bus_constants/22.json';
import bus_23 from './bus_constants/23.json';
import bus_26 from './bus_constants/26.json';
import bus_28 from './bus_constants/28.json';
import bus_32 from './bus_constants/32.json';
import bus_34 from './bus_constants/34.json';
import bus_39 from './bus_constants/39.json';
import bus_41 from './bus_constants/41.json';
import bus_45 from './bus_constants/45.json';
import bus_47 from './bus_constants/47.json';
import bus_55 from './bus_constants/55.json';
import bus_57 from './bus_constants/57.json';
import bus_66 from './bus_constants/66.json';
import bus_71 from './bus_constants/71.json';
import bus_73 from './bus_constants/73.json';
import bus_77 from './bus_constants/77.json';
import bus_85 from './bus_constants/85.json';
import bus_86 from './bus_constants/86.json';
import bus_89 from './bus_constants/89.json';
import bus_91 from './bus_constants/91.json';
import bus_92 from './bus_constants/92.json';
import bus_111 from './bus_constants/111.json';
import bus_104_109 from './bus_constants/104-109.json';
import bus_61_70_170 from './bus_constants/61-70-170.json';
import bus_114_116_117 from './bus_constants/114-116-117.json';
import bus_220_221_222 from './bus_constants/220-221-222.json';

export const rtStations: { [key in Exclude<LineShort, 'Bus' | 'Commuter Rail'>]: LineMap } =
  stations_json;

export const busStations: { [key: string]: LineMap } = {
  ...bus_1,
  ...bus_4,
  ...bus_9,
  ...bus_10,
  ...bus_11,
  ...bus_14,
  ...bus_15,
  ...bus_16,
  ...bus_17_19,
  ...bus_18,
  ...bus_21,
  ...bus_22,
  ...bus_23,
  ...bus_26,
  ...bus_28,
  ...bus_32,
  ...bus_34,
  ...bus_39,
  ...bus_41,
  ...bus_45,
  ...bus_47,
  ...bus_55,
  ...bus_57,
  ...bus_66,
  ...bus_71,
  ...bus_73,
  ...bus_77,
  ...bus_85,
  ...bus_86,
  ...bus_89,
  ...bus_91,
  ...bus_92,
  ...bus_111,
  ...bus_104_109,
  ...bus_61_70_170,
  ...bus_114_116_117,
  ...bus_220_221_222,
};

export const commuterRailStations: { [key: string]: LineMap } = {};

export const stations = { ...rtStations, Bus: busStations };

export const getBusRoutes = (): string[] => {
  return Object.keys(busStations);
};

export const getCommuterRailRoutes = (): string[] => {
  return Object.keys(commuterRailStations);
};
