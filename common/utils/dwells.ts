import type { SingleDayDataPoint } from '../types/charts';

export const averageDwells = (dwells: SingleDayDataPoint[]) => {
  if (!(dwells.length >= 1)) {
    return 0;
  }
  const totalDwell = dwells
    .map((trip) => trip.dwell_time_sec)
    .reduce((total: number, dwell) => {
      if (dwell) return total + dwell;
    }, 0);
  return (totalDwell || 0) / dwells.length;
};

export const longestDwells = (dwells: SingleDayDataPoint[]) => {
  if (!(dwells.length >= 1)) {
    return 0;
  }
  const allDwells = dwells
    .map((trip) => trip.dwell_time_sec)
    .filter((dwell) => dwell !== undefined) as number[];
  return Math.max(...allDwells);
};
