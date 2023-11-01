export type Line = 'line-red' | 'line-orange' | 'line-green' | 'line-blue' | 'line-bus';
export type LineShort = 'Red' | 'Orange' | 'Green' | 'Blue' | 'Bus';
export type LinePath = 'red' | 'orange' | 'green' | 'blue' | 'bus';
export type BusRoute =
  | '1'
  | '15'
  | '22'
  | '23'
  | '28'
  | '32'
  | '39'
  | '57'
  | '66'
  | '71'
  | '73'
  | '77'
  | '111'
  | '114/116/117';

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
export const LANDING_RAIL_LINES: Line[] = ['line-red', 'line-orange', 'line-blue', 'line-green'];

export const RAIL_LINES = ['red', 'orange', 'green', 'blue'];
export const BUS_ROUTES = [
  '1',
  '15',
  '22',
  '23',
  '28',
  '32',
  '39',
  '57',
  '66',
  '71',
  '73',
  '77',
  '111',
  '114/116/117',
];

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
