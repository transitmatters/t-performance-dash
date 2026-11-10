import { formatPercentChange } from '../../../utils/statDelta';
import { getFormattedTimeString } from '../../../utils/time';
import type { WidgetComparison } from '../MiniWidgetCreator';

export const formatComparisonDelta = (comparison: WidgetComparison) => {
  const abs = Math.abs(comparison.delta);
  if (comparison.unit === 'percentage') return formatPercentChange(abs, { signed: false });
  return getFormattedTimeString(abs);
};

export const isNegligible = (comparison: WidgetComparison) =>
  comparison.unit === 'percentage'
    ? Math.abs(comparison.delta) <= 0.01
    : Math.abs(comparison.delta) <= 1;
