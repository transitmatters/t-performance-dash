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
  reliability: ['commuter-rail', 'the-ride'],
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

/** Single-day trip charts that can be iframed, and the modes whose trip page shows each one. */
export const EMBED_TRIP_CHART_LINES = {
  traveltimes: ALL_MODES,
  headways: ALL_MODES,
  dwells: [...RAIL_LINES, 'commuter-rail'],
  'headway-distribution': [...RAIL_LINES, 'ferry'],
} satisfies Record<string, string[]>;

export type TripEmbedChart = keyof typeof EMBED_TRIP_CHART_LINES;

export const isTripEmbed = (line: string, chart: string): chart is TripEmbedChart =>
  Object.hasOwn(EMBED_TRIP_CHART_LINES, chart) &&
  EMBED_TRIP_CHART_LINES[chart as TripEmbedChart].includes(line);

/** Prerendered like STATIC_PATHS so S3 serves them, but they get no link-preview card. */
export const EMBED_PATHS: string[] = [
  ...EMBED_SLOWZONES_LINES.map((line) => `/embed/${line}/slowzones/`),
  ...Object.entries(EMBED_TRIP_CHART_LINES).flatMap(([chart, lines]) =>
    lines.map((line) => `/embed/${line}/trips/single/${chart}/`)
  ),
];
