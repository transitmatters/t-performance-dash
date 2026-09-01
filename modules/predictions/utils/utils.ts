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
    case 'line-mattapan': {
      return 'Mattapan';
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

  const peak = {
    ...predictionsList.reduce(
      (max, pred) =>
        pred.num_accurate_predictions / pred.num_predictions >
        max.num_accurate_predictions / max.num_predictions
          ? pred
          : max,
      predictionsList[0]
    ),
  };

  const worst = {
    ...predictionsList.reduce(
      (min, pred) =>
        pred.num_accurate_predictions / pred.num_predictions <
        min.num_accurate_predictions / min.num_predictions
          ? pred
          : min,
      predictionsList[0]
    ),
  };

  return {
    peak,
    worst,
    average,
  };
};

const weeklyAccuracy = (week: TimePredictionWeek) => {
  const accurate = week.prediction.reduce(
    (sum, pred) =>
      !isNaN(pred.num_accurate_predictions) ? sum + pred.num_accurate_predictions : sum,
    0
  );
  const total = week.prediction.reduce(
    (sum, pred) => (!isNaN(pred.num_predictions) ? sum + pred.num_predictions : sum),
    0
  );
  return { accurate, total };
};

const mean = (values: number[]) =>
  values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : NaN;

/**
 * Headline KPIs for the Predictions page's summary cards, derived entirely from the already-fetched
 * prediction data (no extra requests). The accuracy delta compares the trailing half of the weeks
 * against the leading half — a "trending up/down over this window" signal. Higher accuracy is good.
 */
export const getPredictionStats = (data: TimePredictionWeek[]) => {
  const perWeek = data
    .map(weeklyAccuracy)
    .filter(({ total }) => total > 0)
    .map(({ accurate, total }) => accurate / total);

  const totals = data.reduce(
    (acc, week) => {
      const { accurate, total } = weeklyAccuracy(week);
      return { accurate: acc.accurate + accurate, total: acc.total + total };
    },
    { accurate: 0, total: 0 }
  );
  const overallAccuracy = totals.total ? totals.accurate / totals.total : NaN;

  const mid = Math.floor(perWeek.length / 2);
  const leading = perWeek.slice(0, mid);
  const trailing = perWeek.slice(mid);
  const accuracyDelta = leading.length && trailing.length ? mean(trailing) - mean(leading) : NaN;

  const { peak, worst } = calcValues(data);

  return {
    overallAccuracy,
    accuracyDelta,
    peakAccuracy: peak.num_accurate_predictions / peak.num_predictions,
    peakDate: peak.weekly,
    worstAccuracy: worst.num_accurate_predictions / worst.num_predictions,
    worstDate: worst.weekly,
  };
};
