export type Line =
  | 'line-red'
  | 'line-orange'
  | 'line-green'
  | 'line-blue'
  | 'line-mattapan'
  | 'line-bus'
  | 'line-commuter-rail'
  | 'line-ferry';

export type LineShort =
  | 'Red'
  | 'Orange'
  | 'Green'
  | 'Blue'
  | 'Mattapan'
  | 'Bus'
  | 'Commuter Rail'
  | 'Ferry';

export type LinePath =
  | 'red'
  | 'orange'
  | 'green'
  | 'blue'
  | 'mattapan'
  | 'bus'
  | 'commuter-rail'
  | 'ferry';

export type FerryRoute =
  | 'Boat-F1'
  | 'Boat-F4'
  | 'Boat-F6'
  | 'Boat-F7'
  | 'Boat-EastBoston'
  | 'Boat-Lynn';

/** All currently available Bus Routes */
export type BusRoute =
  | '1'
  | '4'
  | '7'
  | '8'
  | '9'
  | '10'
  | '11'
  | '14'
  | '15'
  | '16'
  | '17/19'
  | '18'
  | '21'
  | '22'
  | '23'
  | '24'
  | '26'
  | '28'
  | '29'
  | '30'
  | '31'
  | '32'
  | '33'
  | '34'
  | '35'
  | '36'
  | '37'
  | '38'
  | '39'
  | '40'
  | '41'
  | '42'
  | '43'
  | '44'
  | '45'
  | '47'
  | '50'
  | '51'
  | '55'
  | '57'
  | '59'
  | '60'
  | '61'
  | '64'
  | '66'
  | '68'
  | '69'
  | '70'
  | '71'
  | '73'
  | '77'
  | '78'
  | '80'
  | '83'
  | '85'
  | '86'
  | '86-legacy'
  | '87'
  | '88'
  | '89'
  | '90'
  | '91'
  | '92'
  | '93'
  | '94'
  | '95'
  | '96'
  | '97'
  | '99'
  | '100'
  | '101'
  | '104'
  | '104/109'
  | '105'
  | '106'
  | '108'
  | '109'
  | '110'
  | '111'
  | '112'
  | '114/116/117'
  | '116'
  | '119'
  | '61/70/170'
  | '120'
  | '121'
  | '131'
  | '132'
  | '134'
  | '137'
  | '171'
  | '201'
  | '202'
  | '210'
  | '211'
  | '215'
  | '216'
  | '217'
  | '220/221/222'
  | '225'
  | '226'
  | '230'
  | '236'
  | '238'
  | '240'
  | '245'
  | '350'
  | '351'
  | '354'
  | '429'
  | '455'
  | '456'
  | 'CT2'
  | 'CT3';

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
  | 'CR-NewBedford'
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
  'line-mattapan': 'line-Mattapan',
};

export const GTFS_COLOR_LINE_IDS = [
  'line-Red',
  'line-Orange',
  'line-Blue',
  'line-Green',
  'line-Mattapan',
] as const;
export type GtfsColorLineId = (typeof GTFS_COLOR_LINE_IDS)[number];

export const HEAVY_RAIL_LINES: Line[] = ['line-red', 'line-orange', 'line-blue'];
export const LANDING_RAIL_LINES: Line[] = [
  'line-red',
  'line-orange',
  'line-blue',
  'line-green',
  'line-mattapan',
  'line-commuter-rail',
];

export const RAIL_LINES = ['red', 'orange', 'green', 'blue', 'mattapan'];
export const BUS_ROUTES: BusRoute[] = [
  '1',
  '4',
  '7',
  '8',
  '9',
  '10',
  '11',
  '14',
  '15',
  '16',
  '17/19',
  '18',
  '21',
  '22',
  '23',
  '24',
  '26',
  '28',
  '29',
  '30',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36',
  '37',
  '38',
  '39',
  '40',
  '41',
  '42',
  '43',
  '44',
  '45',
  '47',
  '50',
  '51',
  '55',
  '57',
  '59',
  '60',
  '61',
  '61/70/170',
  '64',
  '66',
  '68',
  '69',
  '70',
  '71',
  '73',
  '77',
  '78',
  '80',
  '83',
  '85',
  '86',
  '87',
  '88',
  '89',
  '90',
  '91',
  '92',
  '93',
  '94',
  '95',
  '96',
  '97',
  '99',
  '100',
  '101',
  '104/109',
  '105',
  '106',
  '108',
  '110',
  '111',
  '112',
  '114/116/117',
  '119',
  '120',
  '121',
  '131',
  '132',
  '134',
  '137',
  '171',
  '201',
  '202',
  '210',
  '211',
  '215',
  '216',
  '217',
  '220/221/222',
  '225',
  '226',
  '230',
  '236',
  '238',
  '240',
  '245',
  '350',
  '351',
  '354',
  '429',
  '455',
  '456',
  'CT2',
  'CT3',
];

export const FERRY_ROUTES: FerryRoute[] = [
  'Boat-F1',
  'Boat-F4',
  'Boat-F6',
  'Boat-F7',
  'Boat-EastBoston',
  'Boat-Lynn',
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
  'CR-NewBedford',
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
  'CR-NewBedford': 'Fall River/New Bedford Line',
  'CR-Needham': 'Needham Line',
  'CR-Newburyport': 'Newburyport/Rockport Line',
  'CR-Providence': 'Providence/Stoughton Line',
};

export const FERRY_LINE_NAMES: { [line in FerryRoute]: string } = {
  'Boat-F1': 'Hingham/Hull Ferry',
  'Boat-F4': 'Charlestown Ferry',
  'Boat-F6': 'Winthrop Ferry',
  'Boat-F7': 'Quincy Ferry',
  'Boat-EastBoston': 'East Boston Ferry',
  'Boat-Lynn': 'Lynn Ferry',
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

export const FERRY_PATH = {
  params: {
    line: 'ferry',
  },
};
