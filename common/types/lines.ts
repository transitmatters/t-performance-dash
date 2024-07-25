export type Line =
  | 'line-red'
  | 'line-orange'
  | 'line-green'
  | 'line-blue'
  | 'line-bus'
  | 'line-commuter-rail';
export type LineShort = 'Red' | 'Orange' | 'Green' | 'Blue' | 'Bus' | 'Commuter Rail';
export type LinePath = 'red' | 'orange' | 'green' | 'blue' | 'bus' | 'commuter-rail';

/** All currently available Bus Routes */
export type BusRoute =
  | '1'
  | '4'
  | '9'
  | '15'
  | '16'
  | '17/19'
  | '21'
  | '22'
  | '23'
  | '28'
  | '32'
  | '34'
  | '39'
  | '41'
  | '45'
  | '47'
  | '55'
  | '57'
  | '66'
  | '71'
  | '73'
  | '77'
  | '85'
  | '86'
  | '89'
  | '91'
  | '92'
  | '111'
  | '61/70/170'
  | '104/109'
  | '114/116/117'
  | '220/221/222';

export type BusRouteId =
  | Exclude<BusRoute, '17/19' | '61/70/170' | '104/109' | '114/116/117' | '220/221/222'>
  | '1719'
  | '6170170'
  | '104109'
  | '114116117'
  | '220221222';

export type CommuterRailRoute =
  | 'CR-Fitchburg'
  | 'CR-Franklin'
  | 'CR-Greenbush'
  | 'CR-Haverhill'
  | 'CR-Lowell'
  | 'CR-Worcester'
  | 'CR-Fairmount'
  | 'CR-Kingston'
  | 'CR-Middleborough'
  | 'CR-Needham'
  | 'CR-Newburyport'
  | 'CR-Providence';

export type LineMetadata = {
  name: string;
  color: string;
  short: LineShort;
  path: LinePath;
  key: Line;
};
export type LineObject = { [key in Line]: LineMetadata };

export type LineRouteId =
  | Exclude<LineShort, 'Bus' | 'Green'>
  | 'bus'
  | 'Green-B'
  | 'Green-C'
  | 'Green-D'
  | 'Green-E';

export const RIDERSHIP_KEYS = {
  'line-red': 'line-Red',
  'line-orange': 'line-Orange',
  'line-blue': 'line-Blue',
  'line-green': 'line-Green',
};

export const GTFS_COLOR_LINE_IDS = ['line-Red', 'line-Orange', 'line-Blue', 'line-Green'] as const;
export type GtfsColorLineId = (typeof GTFS_COLOR_LINE_IDS)[number];

export const HEAVY_RAIL_LINES: Line[] = ['line-red', 'line-orange', 'line-blue'];
export const LANDING_RAIL_LINES: Line[] = [
  'line-red',
  'line-orange',
  'line-blue',
  'line-green',
  'line-commuter-rail',
];

export const RAIL_LINES = ['red', 'orange', 'green', 'blue'];
export const BUS_ROUTES: BusRoute[] = [
  '1',
  '4',
  '9',
  '15',
  '16',
  '21',
  '22',
  '23',
  '28',
  '32',
  '34',
  '39',
  '41',
  '45',
  '47',
  '55',
  '57',
  '66',
  '71',
  '73',
  '77',
  '85',
  '86',
  '89',
  '91',
  '92',
  '111',
  '17/19',
  '61/70/170',
  '104/109',
  '114/116/117',
  '220/221/222',
];

export const COMMUTER_RAIL_ROUTES: CommuterRailRoute[] = [
  'CR-Fairmount',
  'CR-Fitchburg',
  'CR-Worcester',
  'CR-Franklin',
  'CR-Greenbush',
  'CR-Haverhill',
  'CR-Kingston',
  'CR-Lowell',
  'CR-Middleborough',
  'CR-Needham',
  'CR-Newburyport',
  'CR-Providence',
];

export const COMMUTER_RAIL_LINE_NAMES: { [line in CommuterRailRoute]: string } = {
  'CR-Fitchburg': 'Fitchburg Line',
  'CR-Franklin': 'Franklin Line',
  'CR-Greenbush': 'Greenbush Line',
  'CR-Haverhill': 'Haverhill Line',
  'CR-Lowell': 'Lowell Line',
  'CR-Worcester': 'Worcester Line',
  'CR-Fairmount': 'Fairmount Line',
  'CR-Kingston': 'Kingston/Plymouth Line',
  'CR-Middleborough': 'Middleborough Line',
  'CR-Needham': 'Needham Line',
  'CR-Newburyport': 'Newburyport/Rockport Line',
  'CR-Providence': 'Providence/Stoughton Line',
};

export const ALL_LINE_PATHS = RAIL_LINES.map((line) => {
  return {
    params: {
      line: line,
    },
  };
});

export const BUS_PATH = {
  params: {
    line: 'bus',
  },
};

export const COMMUTER_RAIL_PATH = {
  params: {
    line: 'commuter-rail',
  },
};
