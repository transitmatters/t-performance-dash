import type { AggregateDataPoint, SingleDayDataPoint } from '../types/charts';

export const averageHeadway = (headways: SingleDayDataPoint[] | AggregateDataPoint[]) => {
  if (headways && headways.length >= 1) {
    const totalSum = headways
      .map((trip: SingleDayDataPoint | AggregateDataPoint) =>
        'mean' in trip ? trip.mean : trip.headway_time_sec
      )
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

export const longestHeadway = (headways: SingleDayDataPoint[] | AggregateDataPoint[]) => {
  if (headways && headways.length >= 1) {
    const allHeadways = headways
      .map((trip: SingleDayDataPoint | AggregateDataPoint) =>
        'max' in trip ? trip.max : trip.headway_time_sec
      )
      .filter((headway) => headway !== undefined) as number[];
    return Math.max(...allHeadways);
  } else {
    return 0;
  }
};
