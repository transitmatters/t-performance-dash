import { RAIL_LINES } from '../types/lines';

const ALL_MODES = [...RAIL_LINES, 'bus', 'commuter-rail', 'ferry'];

/**
 * Which line paths each `/$line/...` page exists for. Routes 404 any other line, and the build
 * prerenders one HTML file per combination so S3 can serve every deep link directly.
 */
export const LINE_PAGE_LINES = {
  '': ALL_MODES,
  delays: [...RAIL_LINES, 'bus', 'commuter-rail'],
  fleet: [...RAIL_LINES, 'bus', 'commuter-rail'],
  leaderboard: ['bus'],
  predictions: RAIL_LINES,
  reliability: [...RAIL_LINES, 'commuter-rail', 'the-ride'],
  ridership: [...ALL_MODES, 'the-ride'],
  service: [...RAIL_LINES, 'commuter-rail'],
  slowzones: RAIL_LINES,
  speed: [...RAIL_LINES, 'bus'],
  speedmap: ['bus'],
  'trips/multi': ALL_MODES,
  'trips/single': ALL_MODES,
} satisfies Record<string, string[]>;

export type LinePageKey = keyof typeof LINE_PAGE_LINES;

const OTHER_PATHS = [
  '/',
  '/opensource/',
  '/rapidtransit/',
  '/slowzones/',
  '/system/',
  '/system/ridership/',
  '/system/slowzones/',
];

export const STATIC_PATHS: string[] = [
  ...OTHER_PATHS,
  ...Object.entries(LINE_PAGE_LINES).flatMap(([page, lines]) =>
    lines.map((line) => `/${line}/${page ? `${page}/` : ''}`)
  ),
];

/** Lines with an iframe-able total slow time chart; `system` draws every line on one chart. */
export const EMBED_SLOWZONES_LINES = [...RAIL_LINES, 'system'];

/** Service page charts that can be iframed, and the lines whose Service page shows each one. */
export const EMBED_SERVICE_CHART_LINES = {
  'round-trips': RAIL_LINES,
  delivered: RAIL_LINES,
  hours: ['red', 'orange', 'blue'],
  'by-hour': RAIL_LINES,
} satisfies Record<string, string[]>;

export type ServiceEmbedChart = keyof typeof EMBED_SERVICE_CHART_LINES;

export const isServiceEmbed = (line: string, chart: string): chart is ServiceEmbedChart => {
  const charts: Record<string, string[]> = EMBED_SERVICE_CHART_LINES;
  return Object.hasOwn(charts, chart) && charts[chart].includes(line);
};

/** Delays page charts that can be iframed, each for every line with a Delays page. */
export const EMBED_DELAYS_CHARTS = ['total', 'causes', 'breakdown'] as const;

export type DelaysEmbedChart = (typeof EMBED_DELAYS_CHARTS)[number];

export const isDelaysEmbed = (line: string, chart: string): chart is DelaysEmbedChart =>
  EMBED_DELAYS_CHARTS.includes(chart as DelaysEmbedChart) && LINE_PAGE_LINES.delays.includes(line);

/** Trip charts that can be iframed, by trip page, and the modes whose trip page shows each one. */
export const EMBED_TRIP_CHART_LINES = {
  single: {
    traveltimes: ALL_MODES,
    headways: ALL_MODES,
    dwells: [...RAIL_LINES, 'commuter-rail'],
    'headway-distribution': [...RAIL_LINES, 'ferry'],
  },
  multi: {
    traveltimes: ALL_MODES,
    speeds: RAIL_LINES,
    headways: ALL_MODES,
    dwells: [...RAIL_LINES, 'commuter-rail'],
    'traveltimes-by-hour': ALL_MODES,
  },
} satisfies Record<string, Record<string, string[]>>;

export type TripEmbedPage = keyof typeof EMBED_TRIP_CHART_LINES;
export type TripEmbedChart<P extends TripEmbedPage> = Extract<
  keyof (typeof EMBED_TRIP_CHART_LINES)[P],
  string
>;

export const isTripEmbed = <P extends TripEmbedPage>(
  page: P,
  line: string,
  chart: string
): chart is TripEmbedChart<P> => {
  const charts: Record<string, string[]> = EMBED_TRIP_CHART_LINES[page];
  return Object.hasOwn(charts, chart) && charts[chart].includes(line);
};

/** Prerendered like STATIC_PATHS so S3 serves them, but they get no link-preview card. */
export const EMBED_PATHS: string[] = [
  ...EMBED_SLOWZONES_LINES.map((line) => `/embed/${line}/slowzones/`),
  ...Object.entries(EMBED_SERVICE_CHART_LINES).flatMap(([chart, lines]) =>
    lines.map((line) => `/embed/${line}/service/${chart}/`)
  ),
  ...Object.entries(EMBED_TRIP_CHART_LINES).flatMap(([page, charts]) =>
    Object.entries(charts).flatMap(([chart, lines]) =>
      lines.map((line) => `/embed/${line}/trips/${page}/${chart}/`)
    )
  ),
  ...EMBED_DELAYS_CHARTS.flatMap((chart) =>
    LINE_PAGE_LINES.delays.map((line) => `/embed/${line}/delays/${chart}/`)
  ),
];
