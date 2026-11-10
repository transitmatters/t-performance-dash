import { formatPercentChange } from '../../../utils/statDelta';
import { getFormattedTimeString } from '../../../utils/time';
import type { WidgetComparison } from '../MiniWidgetCreator';

export const formatComparisonDelta = (comparison: WidgetComparison) => {
  const abs = Math.abs(comparison.delta);
  if (comparison.unit === 'percentage') return formatPercentChange(abs, { signed: false });
  if (comparison.unit === 'mph') return `${abs.toFixed(1)} mph`;
  return getFormattedTimeString(abs);
};

export const isNegligible = (comparison: WidgetComparison) => {
  const abs = Math.abs(comparison.delta);
  if (comparison.unit === 'percentage') return abs <= 0.01;
  if (comparison.unit === 'mph') return abs < 0.05;
  return abs <= 1;
};

/** A longer trip or wait is worse; a higher speed or on-time share is better. */
export const isWorse = (comparison: WidgetComparison) =>
  comparison.higherIsBetter ? comparison.delta < 0 : comparison.delta > 0;
