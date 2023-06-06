import { DeltaTimeWidgetValue } from '../types/basicWidgets';
import type { AggregateDataPoint, SingleDayDataPoint } from '../types/charts';

export const averageTravelTime = (traveltimes: (number | undefined)[]) => {
  if (traveltimes && traveltimes.length >= 1) {
    const totalSum = traveltimes.reduce((a, b) => {
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

export const fastestAggregateTravelTime = (traveltimes: AggregateDataPoint[]) => {
  return traveltimes.reduce(
    (currentFastest, datapoint) =>
      datapoint.min < currentFastest.min ? datapoint : currentFastest,
    traveltimes[0]
  );
};

export const slowestSingleTravelTime = (traveltimes: SingleDayDataPoint[]) => {
  return traveltimes.reduce((currentSlowest, datapoint) => {
    if (datapoint.travel_time_sec && currentSlowest.travel_time_sec) {
      return datapoint?.travel_time_sec > currentSlowest?.travel_time_sec
        ? datapoint
        : currentSlowest;
    }
    return currentSlowest;
  }, traveltimes[0]);
};

export const fastestSingleTravelTime = (traveltimes: SingleDayDataPoint[]) => {
  return traveltimes.reduce((currentFastest, datapoint) => {
    if (datapoint.travel_time_sec && currentFastest.travel_time_sec) {
      return datapoint?.travel_time_sec < currentFastest?.travel_time_sec
        ? datapoint
        : currentFastest;
    }
    return currentFastest;
  }, traveltimes[0]);
};

export const deltaTravelTimesAggregate = (traveltimes: AggregateDataPoint[]) => {
  return new DeltaTimeWidgetValue(
    traveltimes[traveltimes.length - 1].mean,
    traveltimes[traveltimes.length - 1].mean - traveltimes[0].mean
  );
};

export const getTravelTimesAggregateWidgetData = (traveltimes: AggregateDataPoint[]) => {
  const average = averageTravelTime(traveltimes.map((datapoint) => datapoint.mean));
  const fastestDataPoint = fastestAggregateTravelTime(traveltimes);
  const deltaWidgetValue = deltaTravelTimesAggregate(traveltimes);
  return { average: average, fastest: fastestDataPoint, deltaWidgetValue: deltaWidgetValue };
};

export const getTravelTimesSingleWidgetData = (traveltimes: SingleDayDataPoint[]) => {
  const average = averageTravelTime(traveltimes.map((datapoint) => datapoint.travel_time_sec));
  const fastestDataPoint = fastestSingleTravelTime(traveltimes);
  const slowestDataPoint = slowestSingleTravelTime(traveltimes);
  return { average: average, fastest: fastestDataPoint, slowest: slowestDataPoint };
};
