import type { Station } from '../types/stations';

export type Turtle = {
  x: number;
  y: number;
  theta: number;
};

export type PathStart = {
  type: 'start';
  turtle: Turtle;
};

export type PathSegment = {
  type: 'line' | 'curve' | 'wiggle';
  path: string;
  turtle: Turtle;
  length: number;
  get: (frac: number) => Turtle;
};

export type PathCommand = (t: Turtle) => PathSegment;

export type StationRange = {
  type: 'stationRange';
  start: null | string;
  end: null | string;
  stations: null | string[];
  commands: PathCommand[];
};

export type PathShape = readonly (PathStart | PathCommand | StationRange)[];

export type PathInterpolator = (progress: number) => Turtle;

export const pathEntryIsStationRange = (el: PathShape[number]): el is StationRange =>
  el && typeof el === 'object' && el.type === 'stationRange';

export type RoutePatternDescriptor = {
  shape: PathShape;
  stationIds: string[];
};

export type PrerenderedRoutePattern = {
  id: string;
  pathInterpolator: PathInterpolator;
  progressPathInterpolator: PathInterpolator;
  stationOffsets: Record<string, number>;
};

export type RoutePattern = {
  shape: PathShape;
  stations: Station[];
};

export type Route = {
  routePatterns: Record<string, RoutePattern>;
};

export type Line = {
  route: Route;
};

export type LineName = 'Red' | 'Blue' | 'Green' | 'Orange';
