import type { Bezier, Projection } from 'bezier-js';

import type { Path } from './path';

export type Turtle = {
  x: number;
  y: number;
  theta: number;
};

export type BaseCommand = {
  ranges: RangeNames;
};

export type LineCommand = BaseCommand & {
  type: 'line';
  length: number;
};

export type CurveCommand = BaseCommand & {
  type: 'curve';
  length: number;
  angle: number;
};

export type WiggleCommand = BaseCommand & {
  type: 'wiggle';
  length: number;
  width: number;
};

export type Command = LineCommand | CurveCommand | WiggleCommand;

export type CommandPath = {
  start: Turtle;
  commands: Command[];
  ranges?: RangeNames;
};

export type CommandResult = {
  turtle: Turtle;
  curve: Bezier;
};

export type SegmentLocation<Nullable extends boolean = false> = {
  fromStationId: (Nullable extends true ? null : never) | string;
  toStationId: (Nullable extends true ? null : never) | string;
};

export type RangeNames = string[];

export type RangeLookup = { range: string; fraction: number };

export type PathProjection = {
  segmentProjection: Projection;
  distance: number;
  displacement: number;
};

export type DiagramProjection = {
  segmentProjection: Projection;
  path: Path;
  segmentLocation: SegmentLocation<true>;
};
