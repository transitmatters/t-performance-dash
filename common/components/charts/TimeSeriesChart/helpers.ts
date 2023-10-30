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

export const getDefaultTimeAxis = <Unit extends Granularity>(
  unit: null | Unit
): ResolvedTimeAxis => {
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

export const getLabelsForData = <Data extends Dataset[]>(data: Data) => {
  const allPoints = data
    .map((dataset) => dataset.data.map((point) => ('date' in point ? point.date : point.time)))
    .flat();
  const uniqueAndSortedPoints = [...new Set(allPoints)].sort();
  return uniqueAndSortedPoints;
};

export const mergeAndApplyStyles = <
  Point extends DataPoint,
  Styles extends Partial<DisplayStyle<Point>>,
>(
  styles: (undefined | Styles)[],
  data: Point[]
): AppliedDisplayStyle<Point> => {
  return styles.reduce((merged, style) => {
    const entries = Object.entries(style ?? {}).map(([key, value]) => {
      if (typeof value === 'object' && value && 'byPoint' in value) {
        const dataByPoint = data.map((point) => value.byPoint(point));
        return [key, dataByPoint];
      }
      return [key, value];
    });
    const appliedStyle: Partial<AppliedDisplayStyle<Point>> = Object.fromEntries(entries);
    return {
      ...merged,
      ...appliedStyle,
    };
  }, defaultStyle as AppliedDisplayStyle<Point>);
};

export const getFillProps = (style: AppliedDisplayStyle<DataPoint>) => {
  const { fillColor, fillPattern, fill, color: lineColor, pointColor } = style;
  const resolvedFillColor = fillColor ?? (fill ? lineColor : null);
  if (resolvedFillColor) {
    const backgroundColor =
      fillPattern === 'solid'
        ? resolvedFillColor
        : fillPattern === 'slightly-transparent'
<<<<<<< HEAD
          ? hexWithAlpha(resolvedFillColor, 0.8)
          : pattern.draw('diagonal', 'transparent', resolvedFillColor, 5);
=======
        ? hexWithAlpha(resolvedFillColor, 0.8)
        : pattern.draw('diagonal', 'transparent', resolvedFillColor, 5);
>>>>>>> main
    return {
      fill: true,
      backgroundColor,
      pointBackgroundColor: pointColor || backgroundColor,
    };
  }
  return { pointBackgroundColor: pointColor || lineColor };
};
