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
  const uniqueAndSortedPoints = [...new Set(allPoints)].toSorted();
  return uniqueAndSortedPoints;
};

export const mergeAndApplyStyles = <Point extends DataPoint>(
  styles: (undefined | Partial<DisplayStyle<Point>>)[],
  data: Point[]
): AppliedDisplayStyle<Point> => {
  const merged: AppliedDisplayStyle<Point> = { ...defaultStyle };
  styles.forEach((style) => {
    if (!style) return;
    const { pointColor, ...rest } = style;
    Object.assign(merged, rest);
    // pointColor is the one style that can be given per point
    if ('pointColor' in style) {
      Object.assign(merged, {
        pointColor:
          typeof pointColor === 'object' && pointColor
            ? data.map((point) => pointColor.byPoint(point))
            : pointColor,
      });
    }
  });
  return merged;
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
