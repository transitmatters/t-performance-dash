import type { CurveCommand, LineCommand, RangeNames, WiggleCommand } from './types';

export const line = (length: number, ranges: RangeNames = []): LineCommand => {
  return {
    type: 'line',
    length,
    ranges,
  };
};

export const curve = (length: number, angle: number, ranges: RangeNames = []): CurveCommand => {
  return {
    type: 'curve',
    length,
    angle,
    ranges,
  };
};

export const wiggle = (length: number, width: number, ranges: RangeNames = []): WiggleCommand => {
  return {
    type: 'wiggle',
    length,
    width,
    ranges,
  };
};
