export type Line =
  | 'line-red'
  | 'line-orange'
  | 'line-green'
  | 'line-blue'
  | 'line-mattapan'
  | 'line-bus'
  | 'line-commuter-rail'
  | 'line-ferry'
  | 'line-RIDE';

export type LineShort =
  | 'Red'
  | 'Orange'
  | 'Green'
  | 'Blue'
  | 'Mattapan'
  | 'Bus'
  | 'Commuter Rail'
  | 'Ferry'
  | 'The RIDE';

export type LinePath =
  | 'red'
  | 'orange'
  | 'green'
  | 'blue'
  | 'mattapan'
  | 'bus'
  | 'commuter-rail'
  | 'ferry'
  | 'the-ride';

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
  | '24/27/33'
  | '26'
  | '28'
  | '29'
  | '30'
  | '31'
  | '32'
  | '34'
  | '35'
  | '36'
  | '37'
  | '38'
  | '39'
  | '40/50'
  | '41'
  | '42'
  | '43'
  | '44'
  | '45'
  | '47'
  | '51'
  | '52/59'
  | '55'
  | '57'
  | '60/65'
  | '61/70/170'
  | '62/76'
  | '66'
  | '67/79'
  | '69'
  | '71'
  | '72/74/75'
  | '73'
  | '77'
  | '78/84'
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
  | '104/109'
  | '104'
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
  | '120/121'
  | '131/132'
  | '134'
  | '136/137'
  | '201/202'
  | '201/202'
  | '210/211/212'
  | '214/216'
  | '215'
  | '217/245'
  | '220/221/222'
  | '225/226'
  | '230'
  | '236'
  | '238'
  | '240'
  | '350/351'
  | '354'
  | '411/430'
  | '424/450/456'
  | '426/428'
  | '429'
  | '434/435/436'
  | '439/441/442'
  | '455'
  | '451/465'
  | '501/503'
  | '502/504'
  | '505/553/554'
  | '556/558'
  | '712/713'
  | 'CT2'
  | 'CT3/171'
  | 'SL1/SL2/SL3/SLW'
  | 'SL4/SL5';

export type BusRouteId =
  | Exclude<
      BusRoute,
      | '17/19'
      | '24/27/33'
      | '40/50'
      | '52/59'
      | '60/65'
      | '61/70/170'
      | '62/76'
      | '67/79'
      | '72/74/75'
      | '78/84'
      | '104/109'
      | '114/116/117'
      | '120/121'
      | '131/132'
      | '136/137'
      | '201/202'
      | '210/211/212'
      | '214/216'
      | '217/245'
      | '220/221/222'
      | '225/226'
      | '350/351'
      | '411/430'
      | '424/450/456'
      | '426/428'
      | '434/435/436'
      | '439/441/442'
      | '451/465'
      | '501/503'
      | '502/504'
      | '505/553/554'
      | '556/558'
      | '712/713'
      | 'SL1/SL2/SL3/SLW'
      | 'SL4/SL5'
      | 'CT2'
      | 'CT3/171'
    >
  | '1719'
  | '242733'
  | '4050'
  | '5259'
  | '6065'
  | '6170170'
  | '6276'
  | '6779'
  | '727475'
  | '7884'
  | '104109'
  | '114116117'
  | '120121'
  | '131132'
  | '136137'
  | '201202'
  | '210211212'
  | '214216'
  | '217245'
  | '220221222'
  | '225226'
  | '350351'
  | '411430'
  | '424450456'
  | '426428'
  | '434435436'
  | '439441442'
  | '451465'
  | '501503'
  | '502504'
  | '505553554'
  | '556558'
  | '712713'
  | 'SL1SL2SL3SLW'
  | 'SL4SL5'
  | 'CT2'
  | 'CT3171';

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
  'line-RIDE': 'line-RIDE',
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
  '24/27/33',
  '26',
  '28',
  '29',
  '30',
  '31',
  '32',
  '34',
  '35',
  '36',
  '37',
  '38',
  '39',
  '40/50',
  '41',
  '42',
  '43',
  '44',
  '45',
  '47',
  '51',
  '52/59',
  '55',
  '57',
  '61/70/170',
  '62/76',
  '66',
  '67/79',
  '69',
  '71',
  '72/74/75',
  '73',
  '77',
  '78/84',
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
  '104',
  '105',
  '106',
  '108',
  '109',
  '110',
  '111',
  '112',
  '116',
  '114/116/117',
  '119',
  '120/121',
  '131/132',
  '134',
  '136/137',
  '201/202',
  '210/211/212',
  '214/216',
  '215',
  '217/245',
  '220/221/222',
  '225/226',
  '230',
  '236',
  '238',
  '240',
  '350/351',
  '354',
  '411/430',
  '424/450/456',
  '426/428',
  '429',
  '439/441/442',
  '451/465',
  '455',
  '501/503',
  '502/504',
  '505/553/554',
  '556/558',
  '712/713',
  'CT2',
  'CT3/171',
  'SL1/SL2/SL3/SLW',
  'SL4/SL5',
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

export const THE_RIDE_PATH = {
  params: {
    line: 'the-ride',
  },
};
