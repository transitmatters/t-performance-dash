import { RAIL_LINES } from '../types/lines';

const ALL_MODES = [...RAIL_LINES, 'bus', 'commuter-rail', 'ferry'];

/**
 * Which line paths each `/$line/...` page exists for. Routes 404 any other line, and the build
 * prerenders one HTML file per combination so S3 can serve every deep link directly.
 */
export const LINE_PAGE_LINES = {
  '': ALL_MODES,
  delays: [...RAIL_LINES, 'commuter-rail'],
  fleet: RAIL_LINES,
  leaderboard: ['bus'],
  predictions: RAIL_LINES,
  reliability: ['commuter-rail', 'the-ride'],
  ridership: [...ALL_MODES, 'the-ride'],
  service: RAIL_LINES,
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
