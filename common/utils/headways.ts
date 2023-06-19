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

export const longestAggregateHeadway = (headways: AggregateDataPoint[]) => {
  return headways.reduce(
    (current, datapoint) => (datapoint.min < current.min ? datapoint : current),
    headways[0]
  );
};

export const longestSingleHeadway = (headways: SingleDayDataPoint[]) => {
  return headways.reduce((current, datapoint) => {
    if (datapoint.headway_time_sec && current.headway_time_sec)
      return datapoint.headway_time_sec > current.headway_time_sec ? datapoint : current;
    return current;
  }, headways[0]);
};

export const shortestSingleHeadway = (headways: SingleDayDataPoint[]) => {
  return headways.reduce((current, datapoint) => {
    if (datapoint.headway_time_sec && current.headway_time_sec)
      return datapoint.headway_time_sec < current.headway_time_sec ? datapoint : current;
    return current;
  }, headways[0]);
};

export const getHeadwaysAggregateWidgetData = (headways: AggregateDataPoint[]) => {
  return { average: averageHeadway(headways), max: longestAggregateHeadway(headways) };
};

export const getHeadwaysSingleWidgetData = (headways: SingleDayDataPoint[]) => {
  return {
    average: averageHeadway(headways),
    shortest: shortestSingleHeadway(headways),
    longest: longestSingleHeadway(headways),
  };
};
