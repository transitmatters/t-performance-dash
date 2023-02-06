import type { SingleDayDataPoint } from '../types/charts';

export const averageDwells = (dwells: SingleDayDataPoint[]) => {
  if (dwells && dwells.length >= 1) {
    const totalSum = dwells
      .map((trip) => trip.dwell_time_sec)
      .reduce((a, b) => {
        if (a && b) {
          return a + b;
        } else {
          return 0;
        }
      });
    return (totalSum || 0) / dwells.length;
  } else {
    return 0;
  }
};

export const longestDwells = (dwells: SingleDayDataPoint[]) => {
  if (dwells && dwells.length >= 1) {
    const allDwells = dwells
      .map((trip) => trip.dwell_time_sec)
      .filter((dwell) => dwell !== undefined) as number[];
    return Math.max(...allDwells);
  } else {
    return 0;
  }
};
