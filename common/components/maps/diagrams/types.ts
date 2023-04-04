import type { Bezier } from 'bezier-js';

export type RangeNames = string[];

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
