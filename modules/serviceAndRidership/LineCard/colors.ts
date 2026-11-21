import { COLORS } from '../../../common/constants/colors';
import type { LineKind } from '../types';

// Getters so colorblind mode's red, orange and green apply
export const lineKindColors: Record<LineKind, string> = {
  get red() {
    return COLORS.mbta.red;
  },
  get orange() {
    return COLORS.mbta.orange;
  },
  get green() {
    return COLORS.mbta.green;
  },
  blue: '#003da5',
  silver: '#666666',
  bus: '#ffc72c',
  boat: '#1da2d8',
  'regional-rail': '#742573',
};
