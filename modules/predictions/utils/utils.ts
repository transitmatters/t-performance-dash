import { flatten } from 'lodash';
import type { TimePredictionWeek } from '../../../common/types/dataPoints';
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

const calcValues = (predictions: TimePredictionWeek[]) => {
  const predictionsList = flatten(predictions.map(({ prediction }) => prediction));
  const averageAccurate =
    predictionsList.reduce(
      (currentSum, pred) =>
        !isNaN(pred.num_accurate_predictions)
          ? currentSum + pred.num_accurate_predictions
          : currentSum,
      0
    ) / predictionsList.length;
  const averageTotal =
    predictionsList.reduce(
      (currentSum, pred) =>
        !isNaN(pred.num_predictions) ? currentSum + pred.num_predictions : currentSum,
      0
    ) / predictionsList.length;

  const average = averageAccurate / averageTotal;

  return {
    average,
  };
};

export const getDetailsPredictiondWidgetValues = (datapoints: TimePredictionWeek[]) => {
  return calcValues(datapoints);
};
