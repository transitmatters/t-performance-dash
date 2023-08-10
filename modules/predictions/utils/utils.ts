import type { Line, LineRouteId } from '../../../common/types/lines';

export const lineToDefaultRouteId = (line: Line | undefined): LineRouteId => {
  switch (line) {
    case 'line-blue': {
      return 'Blue';
    }
    case 'line-red': {
      return 'Red';
    }
    case 'line-orange': {
      return 'Orange';
    }
    case 'line-green': {
      return 'Green-B';
    }
    case 'line-bus': {
      return 'bus';
    }
    default: {
      return 'Red';
    }
  }
};
