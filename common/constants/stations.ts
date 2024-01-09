/* eslint-disable import/max-dependencies */
import type { LineShort } from '../types/lines';
import type { LineMap } from '../types/stations';
import stations_json from './stations.json';
import bus_1 from './bus_constants/1.json';
import bus_9 from './bus_constants/9.json';
import bus_15 from './bus_constants/15.json';
import bus_16 from './bus_constants/16.json';
import bus_17_19 from './bus_constants/17-19.json';
import bus_21 from './bus_constants/21.json';
import bus_22 from './bus_constants/22.json';
import bus_23 from './bus_constants/23.json';
import bus_28 from './bus_constants/28.json';
import bus_32 from './bus_constants/32.json';
import bus_34 from './bus_constants/34.json';
import bus_39 from './bus_constants/39.json';
import bus_47 from './bus_constants/47.json';
import bus_57 from './bus_constants/57.json';
import bus_66 from './bus_constants/66.json';
import bus_71 from './bus_constants/71.json';
import bus_73 from './bus_constants/73.json';
import bus_77 from './bus_constants/77.json';
import bus_86 from './bus_constants/86.json';
import bus_89 from './bus_constants/89.json';
import bus_111 from './bus_constants/111.json';
import bus_61_70_170 from './bus_constants/61-70-170.json';
import bus_114_116_117 from './bus_constants/114-116-117.json';
import bus_220_221_222 from './bus_constants/220-221-222.json';

import cr_lowell from './cr_constants/cr-lowell.json';
import cr_fitchburg from './cr_constants/cr-fitchburg.json';
import cr_franklin from './cr_constants/cr-franklin.json';
import cr_worcester from './cr_constants/cr-worcester.json';
import cr_haverhill from './cr_constants/cr-haverhill.json';
import cr_greenbush from './cr_constants/cr-greenbush.json';
import cr_fairmount from './cr_constants/cr-fairmount.json';
import cr_kingston from './cr_constants/cr-kingston.json';
import cr_middleborough from './cr_constants/cr-middleborough.json';
import cr_needham from './cr_constants/cr-needham.json';
import cr_providence from './cr_constants/cr-providence.json';

export const rtStations: { [key in Exclude<LineShort, 'Bus' | 'Commuter Rail'>]: LineMap } =
  stations_json;

export const busStations: { [key: string]: LineMap } = {
  ...bus_1,
  ...bus_9,
  ...bus_15,
  ...bus_16,
  ...bus_17_19,
  ...bus_21,
  ...bus_22,
  ...bus_23,
  ...bus_28,
  ...bus_32,
  ...bus_34,
  ...bus_39,
  ...bus_47,
  ...bus_57,
  ...bus_66,
  ...bus_71,
  ...bus_73,
  ...bus_77,
  ...bus_86,
  ...bus_89,
  ...bus_111,
  ...bus_61_70_170,
  ...bus_114_116_117,
  ...bus_220_221_222,
};

export const crStations: { [key: string]: LineMap } = {
  ...cr_lowell,
  ...cr_fitchburg,
  ...cr_franklin,
  ...cr_worcester,
  ...cr_haverhill,
  ...cr_greenbush,
  ...cr_fairmount,
  ...cr_kingston,
  ...cr_middleborough,
  ...cr_needham,
  ...cr_providence,
};

export const stations = { ...rtStations, Bus: busStations, 'Commuter Rail': crStations };

export const getBusRoutes = (): string[] => {
  return Object.keys(busStations);
};

export const getCommuterRailRoutes = (): string[] => {
  return Object.keys(crStations);
};
