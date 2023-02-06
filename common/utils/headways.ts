import type { SingleDayDataPoint } from '../types/charts';

export const averageHeadway = (headways: SingleDayDataPoint[]) => {
  if (headways && headways.length >= 1) {
    const totalSum = headways
      .map((trip) => trip.headway_time_sec)
      .reduce((a, b) => {
        if (a && b) {
          return a + b;
        } else {
          return 0;
        }
      });
    return (totalSum || 0) / headways.length;
  } else {
    return 0;
  }
};

export const longestHeadway = (headways: SingleDayDataPoint[]) => {
  if (headways && headways.length >= 1) {
    const allHeadways = headways
      .map((trip) => trip.headway_time_sec)
      .filter((headway) => headway !== undefined) as number[];
    return Math.max(...allHeadways);
  } else {
    return 0;
  }
};
