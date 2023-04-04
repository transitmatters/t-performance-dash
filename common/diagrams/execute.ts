import { Bezier } from 'bezier-js';

import { Path } from './path';
import type {
  Command,
  CommandPath,
  CommandResult,
  CurveCommand,
  LineCommand,
  RangeNames,
  Turtle,
  WiggleCommand,
} from './types';

const d2r = (degrees: number) => degrees * (Math.PI / 180);
const sind = (theta: number) => Math.sin(d2r(theta));
const cosd = (theta: number) => Math.cos(d2r(theta));
const tand = (theta: number) => Math.tan(d2r(theta));

const executeLine = (command: LineCommand, turtle: Turtle): CommandResult => {
  const { length } = command;
  const { x, y, theta } = turtle;
  const x2 = x + length * cosd(theta);
  const y2 = y + length * sind(theta);
  return {
    curve: new Bezier([
      { x, y },
      { x: (x + x2) / 2, y: (y + y2) / 2 },
      { x: x2, y: y2 },
    ]),
    turtle: { x: x2, y: y2, theta },
  };
};

const executeCurve = (command: CurveCommand, turtle: Turtle): CommandResult => {
  const { length, angle } = command;
  const { x: x1, y: y1, theta } = turtle;
  const nextTheta = theta + angle;
  const x2 = x1 + length * cosd(theta + angle / 2);
  const y2 = y1 + length * sind(theta + angle / 2);
  // Slope of tangent passing through turtle
  const m1 = tand(theta);
  // Slope of tangent passing through output point
  const m2 = tand(nextTheta);
  // Calculate control point, which is the intersection of these two tangent lines
  let xc: number, yc: number;
  if (Math.abs(theta % 360) === 90) {
    // tan(theta) = infinity, so the line through (x1, y1) is vertical, and xc = x1
    xc = x1;
    yc = m2 * (xc - x2) + y2;
  } else {
    xc = (y1 - x1 * m1 - y2 + x2 * m2) / (m2 - m1);
    yc = m1 * (xc - x1) + y1;
  }
  return {
    curve: new Bezier([
      { x: x1, y: y1 },
      { x: xc, y: yc },
      { x: x2, y: y2 },
    ]),
    turtle: {
      x: x2,
      y: y2,
      theta: nextTheta,
    },
  };
};

const executeWiggle = (command: WiggleCommand, turtle: Turtle): CommandResult => {
  const { x: x1, y: y1, theta } = turtle;
  const { length, width } = command;
  const nextTheta = theta; // + 0
  const x2 = x1 + length * cosd(theta) + width * cosd(theta - 90);
  const y2 = y1 + length * sind(theta) + width * sind(theta - 90);
  // The first control point is parallel to the turtle's incoming line, and is half the total
  // distance between (x1, y1) and (x2, y2).
  const halfDist = 0.5 * Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
  const xp1 = x1 + halfDist * cosd(theta);
  const yp1 = y1 + halfDist * sind(theta);
  // The second control point is parallel to the turtle's outgoing line, and is also half the
  // total point-point distance.
  const xp2 = x2 - halfDist * cosd(nextTheta);
  const yp2 = y2 - halfDist * sind(nextTheta);
  return {
    curve: new Bezier([
      { x: x1, y: y1 },
      { x: xp1, y: yp1 },
      { x: xp2, y: yp2 },
      { x: x2, y: y2 },
    ]),
    turtle: { x: x2, y: y2, theta: nextTheta },
  };
};

const executeCommand = (command: Command, turtle: Turtle) => {
  if (command.type === 'line') {
    return executeLine(command, turtle);
  }
  if (command.type === 'curve') {
    return executeCurve(command, turtle);
  }
  return executeWiggle(command, turtle);
};

export const execute = (path: CommandPath) => {
  const { start, commands, ranges: sharedRanges = [] } = path;
  const { curves, ranges } = commands.reduce(
    (state, command) => {
      const { turtle, curve } = executeCommand(command, state.turtle);
      return {
        curves: [...state.curves, curve],
        ranges: [...state.ranges, [...sharedRanges, ...command.ranges]],
        turtle,
      };
    },
    {
      curves: [] as Bezier[],
      ranges: [] as RangeNames[],
      turtle: start,
    }
  );
  return new Path(curves, ranges);
};
