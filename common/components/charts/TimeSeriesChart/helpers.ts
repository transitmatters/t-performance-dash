import pattern from 'patternomaly';
import { hexWithAlpha } from '../../../utils/general';
import type { AggType } from '../../../../modules/speed/constants/speeds';
import type {
  Granularity,
  Dataset,
  DisplayStyle,
  AppliedDisplayStyle,
  DataPoint,
  ResolvedTimeAxis,
} from './types';
import {
  defaultTimeAxis,
  defaultDayAxis,
  defaultMonthAxis,
  defaultStyle,
  defaultWeekAxis,
} from './defaults';

export const getDefaultTimeAxis = (unit: null | Granularity): ResolvedTimeAxis => {
  if (unit === 'time') {
    return defaultTimeAxis;
  }
  if (unit === 'day') {
    return defaultDayAxis;
  }
  if (unit === 'week') {
    return defaultWeekAxis;
  }
  if (unit === 'month') {
    return defaultMonthAxis;
  }
  return defaultTimeAxis;
};

export const getGranularityForAgg = (agg: AggType): Granularity => {
  if (agg === 'daily') {
    return 'day';
  }
  if (agg === 'weekly') {
    return 'week';
  }
  return 'month';
};

export const getLabelsForData = (data: Dataset[]) => {
  const allPoints = data
    // Gaps (null values) aren't data, so they don't move the "no data since" mark.
    .flatMap((dataset) =>
      dataset.data
        .filter((point) => point.value != null)
        .map((point) => ('date' in point ? point.date : point.time))
    );
  const uniqueAndSortedPoints = [...new Set(allPoints)].sort();
  return uniqueAndSortedPoints;
};

export const mergeAndApplyStyles = <Point extends DataPoint>(
  styles: (undefined | Partial<DisplayStyle<Point>>)[],
  data: Point[]
): AppliedDisplayStyle<Point> => {
  const merged: Record<string, unknown> = { ...defaultStyle };
  styles.forEach((style) => {
    if (!style) return;
    Object.entries(style).forEach(([key, value]) => {
      merged[key] =
        typeof value === 'object' && value && 'byPoint' in value
          ? data.map((point) => value.byPoint(point))
          : value;
    });
  });
  return merged as AppliedDisplayStyle<Point>;
};

export const getFillProps = (style: AppliedDisplayStyle<DataPoint>) => {
  const { fillColor, fillPattern, fill, color: lineColor, pointColor } = style;
  const resolvedFillColor = fillColor ?? (fill ? lineColor : null);
  if (resolvedFillColor) {
    const backgroundColor =
      fillPattern === 'solid'
        ? resolvedFillColor
        : fillPattern === 'slightly-transparent'
          ? hexWithAlpha(resolvedFillColor, 0.8)
          : pattern.draw('diagonal', 'transparent', resolvedFillColor, 5);
    return {
      fill: true,
      backgroundColor,
      pointBackgroundColor: pointColor || backgroundColor,
    };
  }
  return { pointBackgroundColor: pointColor || lineColor };
};
