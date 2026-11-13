import type { TimePredictionWeek } from '../../../common/types/dataPoints';
import type { Line, LineRouteId } from '../../../common/types/lines';

/** The route a subway line's charts read by default. Other modes pick a route in the URL, so they have none. */
export const lineToDefaultRouteId = (line: Line | undefined): LineRouteId | undefined => {
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
      return undefined;
    }
  }
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

/** The weeks with the highest and lowest share of accurate predictions, across all bins. */
const bestAndWorstWeeks = (data: TimePredictionWeek[]) => {
  const weeks = data
    .map((week) => {
      const { accurate, total } = weeklyAccuracy(week);
      return {
        accuracy: total ? accurate / total : NaN,
        date: week.prediction[0]?.weekly ?? week.week,
      };
    })
    .filter(({ accuracy }) => Number.isFinite(accuracy));
  const best = weeks.reduce((max, week) => (week.accuracy > max.accuracy ? week : max), weeks[0]);
  const worst = weeks.reduce((min, week) => (week.accuracy < min.accuracy ? week : min), weeks[0]);
  return { best, worst };
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
  const hasHalves = leading.length > 0 && trailing.length > 0;
  const accuracyBefore = hasHalves ? mean(leading) : NaN;
  const accuracyAfter = hasHalves ? mean(trailing) : NaN;

  const { best, worst } = bestAndWorstWeeks(data);

  return {
    overallAccuracy,
    accuracyDelta: accuracyAfter - accuracyBefore,
    accuracyBefore,
    accuracyAfter,
    peakAccuracy: best?.accuracy ?? NaN,
    peakDate: best?.date,
    worstAccuracy: worst?.accuracy ?? NaN,
    worstDate: worst?.date,
  };
};
