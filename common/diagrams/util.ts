import { stations } from '../constants/stations';

import type { LineName } from './types';

export const getStationsForRoutePattern = (line: LineName, branch?: string) => {
  const stationsForLine = stations[line].stations;
  return stationsForLine
    .filter((station) => !branch || !station.branches || station.branches?.includes(branch))
    .sort((a, b) => a.order - b.order);
};
