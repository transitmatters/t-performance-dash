import Bezier from 'bezier-js';
import type { PathSegment, PathStart, StationRange, Turtle } from './types';
import type { PathCommand } from '.';

const d2r = (degrees: number) => degrees * (Math.PI / 180);
const r2d = (radians: number) => radians * (180 / Math.PI);
const sind = (theta: number) => Math.sin(d2r(theta));
const cosd = (theta: number) => Math.cos(d2r(theta));
const tand = (theta: number) => Math.tan(d2r(theta));
const round = (x: number, n = 2) => Math.round(x * Math.pow(10, n)) / Math.pow(10, n);

const bezierParameterizedPosition =
  (bezier: Bezier) =>
  (frac: number): Turtle => {
    const { x, y } = bezier.get(frac);
    const { x: dx, y: dy } = bezier.derivative(frac);
    return { x, y, theta: r2d(Math.atan2(dy, dx)) };
  };

const path = (strings: TemplateStringsArray, ...args: number[]) => {
  const roundedString = (i: number) => {
    if (args[i] !== undefined) {
      return round(args[i]).toString();
    }
    return '';
  };

  return strings.reduce((acc, next, i) => `${acc}${next}${roundedString(i)}`, '');
};

export const start = (x: number, y: number, theta: number): PathStart => {
  return {
    type: 'start',
    turtle: { x, y, theta },
  };
};

export const line =
  (length: number) =>
  (turtle: Turtle): PathSegment => {
    const { x, y, theta } = turtle;
    const x2 = x + length * cosd(theta);
    const y2 = y + length * sind(theta);
    return {
      type: 'line',
      path: path`M ${x} ${y} L ${x2} ${y2}`,
      turtle: { x: x2, y: y2, theta },
      length: length,
      get: (fraction) => {
        return {
          x: x + fraction * length * cosd(theta),
          y: y + fraction * length * sind(theta),
          theta: theta,
        };
      },
    };
  };

export const curve =
  (length: number, angle: number) =>
  (turtle: Turtle): PathSegment => {
    const { x: x1, y: y1, theta } = turtle;
    const nextTheta = theta + angle;
    const x2 = x1 + length * cosd(theta + angle / 2);
    const y2 = y1 + length * sind(theta + angle / 2);
    // Slope of tangent passing through turtle
    const m1 = tand(theta);
    // Slope of tangent passing through output point
    const m2 = tand(nextTheta);
    // Calculate control point, which is the intersection of these two tangent lines
    let xc, yc;
    if (Math.abs(theta % 360) === 90) {
      // tan(theta) = infinity, so the line through (x1, y1) is vertical, and xc = x1
      xc = x1;
      yc = m2 * (xc - x2) + y2;
    } else {
      xc = (y1 - x1 * m1 - y2 + x2 * m2) / (m2 - m1);
      yc = m1 * (xc - x1) + y1;
    }
    const bezier = new Bezier([
      { x: x1, y: y1 },
      { x: xc, y: yc },
      { x: x2, y: y2 },
    ]);
    return {
      type: 'curve',
      path: path`M ${x1} ${y1} Q ${xc} ${yc} ${x2} ${y2}`,
      turtle: { x: x2, y: y2, theta: nextTheta },
      length: bezier.length(),
      get: bezierParameterizedPosition(bezier),
    };
  };

export const wiggle =
  (length, width, angle = 0) =>
  (turtle: Turtle): PathSegment => {
    const { x: x1, y: y1, theta } = turtle;
    const nextTheta = theta + angle;
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
    const bezier = new Bezier([
      { x: x1, y: y1 },
      { x: xp1, y: yp1 },
      { x: xp2, y: yp2 },
      { x: x2, y: y2 },
    ]);
    return {
      type: 'wiggle',
      path: path`M ${x1} ${y1} C ${xp1} ${yp1} ${xp2} ${yp2} ${x2} ${y2}`,
      turtle: { x: x2, y: y2, theta: nextTheta },
      length: bezier.length(),
      get: bezierParameterizedPosition(bezier),
    };
  };

export const stationRange = ({
  start,
  end,
  stations,
  commands,
}: {
  start?: null | string;
  end?: null | string;
  stations?: string[];
  commands: PathCommand[];
}): StationRange => {
  return {
    type: 'stationRange',
    start: start ?? null,
    end: end ?? null,
    stations: stations ?? null,
    commands,
  };
};
