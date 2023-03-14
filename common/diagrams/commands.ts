import type { CurveCommand, LineCommand, WiggleCommand } from './types';

export const line = (length: number, range?: string): LineCommand => {
  return {
    type: 'line',
    length,
    range,
  };
};

export const curve = (length: number, angle: number, range?: string): CurveCommand => {
  return {
    type: 'curve',
    length,
    angle,
    range,
  };
};

export const wiggle = (length: number, width: number, range?: string): WiggleCommand => {
  return {
    type: 'wiggle',
    length,
    width,
    range,
  };
};
