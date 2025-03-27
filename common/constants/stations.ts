/* eslint-disable import/max-dependencies */
import type { BusRoute, CommuterRailRoute } from '../types/lines';
import { COMMUTER_RAIL_ROUTES, type LineShort } from '../types/lines';
import type { LineMap } from '../types/stations';
import stations_json from './stations.json';
import bus_1 from './bus_constants/1.json';
import bus_4 from './bus_constants/4.json';
import bus_7 from './bus_constants/7.json';
import bus_8 from './bus_constants/8.json';
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
import bus_29 from './bus_constants/29.json';
import bus_30 from './bus_constants/30.json';
import bus_31 from './bus_constants/31.json';
import bus_32 from './bus_constants/32.json';
import bus_34 from './bus_constants/34.json';
import bus_35 from './bus_constants/35.json';
import bus_36 from './bus_constants/36.json';
import bus_37 from './bus_constants/37.json';
import bus_38 from './bus_constants/38.json';
import bus_39 from './bus_constants/39.json';
import bus_41 from './bus_constants/41.json';
import bus_42 from './bus_constants/42.json';
import bus_43 from './bus_constants/43.json';
import bus_44 from './bus_constants/44.json';
import bus_45 from './bus_constants/45.json';
import bus_47 from './bus_constants/47.json';
import bus_51 from './bus_constants/51.json';
import bus_55 from './bus_constants/55.json';
import bus_57 from './bus_constants/57.json';
import bus_66 from './bus_constants/66.json';
import bus_69 from './bus_constants/69.json';
import bus_71 from './bus_constants/71.json';
import bus_73 from './bus_constants/73.json';
import bus_77 from './bus_constants/77.json';
import bus_80 from './bus_constants/80.json';
import bus_83 from './bus_constants/83.json';
import bus_85 from './bus_constants/85.json';
import bus_86 from './bus_constants/86.json';
import bus_87 from './bus_constants/87.json';
import bus_88 from './bus_constants/88.json';
import bus_89 from './bus_constants/89.json';
import bus_90 from './bus_constants/90.json';
import bus_91 from './bus_constants/91.json';
import bus_92 from './bus_constants/92.json';
import bus_93 from './bus_constants/93.json';
import bus_94 from './bus_constants/94.json';
import bus_95 from './bus_constants/95.json';
import bus_96 from './bus_constants/96.json';
import bus_97 from './bus_constants/97.json';
import bus_99 from './bus_constants/99.json';
import bus_111 from './bus_constants/111.json';
import bus_104_109 from './bus_constants/104-109.json';
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
import cr_newbedford from './cr_constants/cr-newbedford.json';
import cr_newburyport from './cr_constants/cr-newburyport.json';
import cr_needham from './cr_constants/cr-needham.json';
import cr_providence from './cr_constants/cr-providence.json';

export const rtStations: { [key in Exclude<LineShort, 'Bus' | 'Commuter Rail'>]: LineMap } =
  stations_json;

export const busStations: { [key in BusRoute]: LineMap } = {
  ...bus_1,
  ...bus_4,
  ...bus_7,
  ...bus_8,
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
  ...bus_29,
  ...bus_30,
  ...bus_31,
  ...bus_32,
  ...bus_34,
  ...bus_35,
  ...bus_36,
  ...bus_37,
  ...bus_38,
  ...bus_39,
  ...bus_41,
  ...bus_42,
  ...bus_43,
  ...bus_44,
  ...bus_45,
  ...bus_47,
  ...bus_51,
  ...bus_55,
  ...bus_57,
  ...bus_66,
  ...bus_69,
  ...bus_71,
  ...bus_73,
  ...bus_77,
  ...bus_80,
  ...bus_83,
  ...bus_85,
  ...bus_86,
  ...bus_87,
  ...bus_88,
  ...bus_89,
  ...bus_90,
  ...bus_91,
  ...bus_92,
  ...bus_93,
  ...bus_94,
  ...bus_95,
  ...bus_96,
  ...bus_97,
  ...bus_99,
  ...bus_111,
  ...bus_104_109,
  ...bus_61_70_170,
  ...bus_114_116_117,
  ...bus_220_221_222,
};

export const crStations: { [key in CommuterRailRoute]: LineMap } = {
  ...cr_lowell,
  ...cr_fitchburg,
  ...cr_franklin,
  ...cr_worcester,
  ...cr_haverhill,
  ...cr_greenbush,
  ...cr_fairmount,
  ...cr_kingston,
  ...cr_middleborough,
  ...cr_newbedford,
  ...cr_newburyport,
  ...cr_needham,
  ...cr_providence,
};

export const stations = { ...rtStations, Bus: busStations, 'Commuter Rail': crStations };

export const getBusRoutes = (): string[] => {
  return Object.keys(busStations);
};

export const getCommuterRailRoutes = (): string[] => {
  return COMMUTER_RAIL_ROUTES;
};
