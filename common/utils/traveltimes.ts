import { DeltaTimeWidgetValue } from '../types/basicWidgets';
import type { AggregateDataPoint } from '../types/charts';

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

export const fastestTravelTime = (traveltimes: AggregateDataPoint[]) => {
  return traveltimes.reduce(
    (currentFastest, datapoint) =>
      datapoint.min < currentFastest.min ? datapoint : currentFastest,
    traveltimes[0]
  );
};

export const deltaTravelTimesAggregate = (traveltimes: AggregateDataPoint[]) => {
  return new DeltaTimeWidgetValue(
    traveltimes[traveltimes.length - 1].mean,
    traveltimes[traveltimes.length - 1].mean - traveltimes[0].mean
  );
};

export const getTravelTimesAggregateWidgetData = (traveltimes: AggregateDataPoint[]) => {
  const average = averageTravelTime(traveltimes.map((datapoint) => datapoint.mean));
  const fastestDataPoint = fastestTravelTime(traveltimes);
  const deltaWidgetValue = deltaTravelTimesAggregate(traveltimes);
  return { average: average, fastest: fastestDataPoint, deltaWidgetValue: deltaWidgetValue };
};
