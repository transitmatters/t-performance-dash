import type { BusRoute, CommuterRailRoute, FerryRoute, LineShort } from '../types/lines';
import { COMMUTER_RAIL_ROUTES } from '../types/lines';
import type { LineMap, StationMap } from '../types/stations';
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
import bus_24_27_33 from './bus_constants/24-27-33.json';
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
import bus_40_50 from './bus_constants/40-50.json';
import bus_52_59 from './bus_constants/52-59.json';
import bus_51 from './bus_constants/51.json';
import bus_55 from './bus_constants/55.json';
import bus_57 from './bus_constants/57.json';
import bus_59 from './bus_constants/59.json';
import bus_60 from './bus_constants/60.json';
import bus_60_65 from './bus_constants/60-65.json';
import bus_62_76 from './bus_constants/62-76.json';
import bus_64 from './bus_constants/64.json';
import bus_66 from './bus_constants/66.json';
import bus_67_69 from './bus_constants/67-79.json';
import bus_68 from './bus_constants/68.json';
import bus_69 from './bus_constants/69.json';
import bus_71 from './bus_constants/71.json';
import bus_72_74_75 from './bus_constants/72-74-75.json';
import bus_73 from './bus_constants/73.json';
import bus_77 from './bus_constants/77.json';
import bus_78_84 from './bus_constants/78-84.json';
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
import bus_100 from './bus_constants/100.json';
import bus_101 from './bus_constants/101.json';
import bus_104 from './bus_constants/104.json';
import bus_105 from './bus_constants/105.json';
import bus_106 from './bus_constants/106.json';
import bus_108 from './bus_constants/108.json';
import bus_109 from './bus_constants/109.json';
import bus_110 from './bus_constants/110.json';
import bus_111 from './bus_constants/111.json';
import bus_112 from './bus_constants/112.json';
import bus_116 from './bus_constants/116.json';
import bus_119 from './bus_constants/119.json';
import bus_120_121 from './bus_constants/120-121.json';
import bus_131_132 from './bus_constants/131-132.json';
import bus_134 from './bus_constants/134.json';
import bus_136_137 from './bus_constants/136-137.json';
import bus_171 from './bus_constants/171.json';
import bus_201_202 from './bus_constants/201-202.json';
import bus_210 from './bus_constants/210.json';
import bus_210_211_212 from './bus_constants/210-211-212.json';
import bus_211 from './bus_constants/211.json';
import bus_214_216 from './bus_constants/214-216.json';
import bus_215 from './bus_constants/215.json';
import bus_217 from './bus_constants/217.json';
import bus_217_245 from './bus_constants/217-245.json';
import bus_225 from './bus_constants/225.json';
import bus_226 from './bus_constants/226.json';
import bus_225_226 from './bus_constants/225-226.json';
import bus_230 from './bus_constants/230.json';
import bus_236 from './bus_constants/236.json';
import bus_238 from './bus_constants/238.json';
import bus_240 from './bus_constants/240.json';
import bus_245 from './bus_constants/245.json';
import bus_350 from './bus_constants/350.json';
import bus_351 from './bus_constants/351.json';
import bus_350_351 from './bus_constants/350-351.json';
import bus_354 from './bus_constants/354.json';
import bus_411_430 from './bus_constants/411-430.json';
import bus_424_450_456 from './bus_constants/424-450-456.json';
import bus_426_428 from './bus_constants/426-428.json';
import bus_429 from './bus_constants/429.json';
import bus_434_435_436 from './bus_constants/434-435-436.json';
import bus_439_441_442 from './bus_constants/439-441-442.json';
import bus_451_465 from './bus_constants/451-465.json';
import bus_455 from './bus_constants/455.json';
import bus_456 from './bus_constants/456.json';
import bus_501_503 from './bus_constants/501-503.json';
import bus_502_504 from './bus_constants/502-504.json';
import bus_505_553_554 from './bus_constants/505-553-554.json';
import bus_556_558 from './bus_constants/556-558.json';
import bus_712_713 from './bus_constants/712-713.json';
import bus_104_109 from './bus_constants/104-109.json';
import bus_61_70_170 from './bus_constants/61-70-170.json';
import bus_114_116_117 from './bus_constants/114-116-117.json';
import bus_220_221_222 from './bus_constants/220-221-222.json';
import bus_ct2 from './bus_constants/CT2.json';
import bus_ct3 from './bus_constants/CT3.json';
import legacy_86 from './bus_constants/86-legacy.json';
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

import ferry_f1 from './ferry_constants/ferry_f1.json';
import ferry_f4 from './ferry_constants/ferry_f4.json';
import ferry_f6 from './ferry_constants/ferry_f6.json';
import ferry_f7 from './ferry_constants/ferry_f7.json';
import ferry_eastboston from './ferry_constants/ferry_eastboston.json';
import ferry_lynn from './ferry_constants/ferry_lynn.json';

export const rtStations: {
  [key in Exclude<LineShort, 'Bus' | 'Commuter Rail' | 'Ferry'>]: LineMap;
} = stations_json;

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
  ...bus_24_27_33,
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
  ...bus_40_50,
  ...bus_51,
  ...bus_52_59,
  ...bus_55,
  ...bus_57,
  ...bus_59,
  ...bus_60,
  ...bus_60_65,
  ...bus_61_70_170,
  ...bus_62_76,
  ...bus_64,
  ...bus_66,
  ...bus_67_69,
  ...bus_68,
  ...bus_69,
  ...bus_71,
  ...bus_72_74_75,
  ...bus_73,
  ...bus_77,
  ...bus_78_84,
  ...bus_80,
  ...bus_83,
  ...bus_85,
  // 86 changed during BNRD
  ...bus_86,
  ...legacy_86,
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
  ...bus_100,
  ...bus_101,
  ...bus_104,
  ...bus_104_109,
  ...bus_105,
  ...bus_106,
  ...bus_108,
  ...bus_109,
  ...bus_110,
  ...bus_111,
  ...bus_112,
  ...bus_114_116_117,
  ...bus_116,
  ...bus_119,
  ...bus_120_121,
  ...bus_131_132,
  ...bus_134,
  ...bus_136_137,
  ...bus_171,
  ...bus_201_202,
  ...bus_210_211_212,
  ...bus_210,
  ...bus_211,
  ...bus_214_216,
  ...bus_215,
  ...bus_217,
  ...bus_217_245,
  ...bus_220_221_222,
  ...bus_225_226,
  ...bus_225,
  ...bus_226,
  ...bus_230,
  ...bus_236,
  ...bus_238,
  ...bus_240,
  ...bus_245,
  ...bus_350_351,
  ...bus_350,
  ...bus_351,
  ...bus_354,
  ...bus_411_430,
  ...bus_424_450_456,
  ...bus_426_428,
  ...bus_429,
  ...bus_434_435_436,
  ...bus_439_441_442,
  ...bus_451_465,
  ...bus_455,
  ...bus_456,
  ...bus_501_503,
  ...bus_502_504,
  ...bus_505_553_554,
  ...bus_556_558,
  ...bus_712_713,
  ...bus_ct2,
  ...bus_ct3,
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

export const ferryStations: { [key in FerryRoute]: LineMap } = {
  ...ferry_f1,
  ...ferry_f4,
  ...ferry_f6,
  ...ferry_f7,
  ...ferry_eastboston,
  ...ferry_lynn,
};

export const stations: StationMap = {
  ...rtStations,
  Bus: busStations,
  'Commuter Rail': crStations,
  Ferry: ferryStations,
};

export const getBusRoutes = (): string[] => {
  return Object.keys(busStations);
};

export const getCommuterRailRoutes = (): string[] => {
  return COMMUTER_RAIL_ROUTES;
};

export const getFerryRoutes = (): string[] => {
  return Object.keys(ferryStations);
};
