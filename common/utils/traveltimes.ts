import type { SingleDayDataPoint } from '../types/charts';

export const averageTravelTime = (traveltimes: SingleDayDataPoint[]) => {
  if (traveltimes && traveltimes.length >= 1) {
    const totalSum = traveltimes
      .map((trip) => trip.travel_time_sec)
      .reduce((a, b) => {
        if (a && b) {
          return a + b;
        } else {
          return 0;
        }
      });
    return (totalSum || 0) / traveltimes.length;
  } else {
    return 0;
  }
};
