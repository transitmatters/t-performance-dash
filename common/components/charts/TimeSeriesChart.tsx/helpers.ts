import pattern from 'patternomaly';

import type {
  Granularity,
  TimeAxis,
  Dataset,
  DisplayStyle,
  AppliedDisplayStyle,
  DataPoint,
} from './types';
import {
  defaultTimeAxis,
  defaultDayAxis,
  defaultMonthAxis,
  defaultYearAxis,
  defaultStyle,
  defaultWeekAxis,
} from './defaults';

const getDefaultTimeAxis = <Unit extends Granularity>(unit: Unit): TimeAxis => {
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
  return defaultYearAxis;
};

export const getTimeAxis = (axis: Partial<TimeAxis>): TimeAxis => {
  return {
    ...getDefaultTimeAxis(axis.granularity ?? 'time'),
    ...axis,
  };
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
        : pattern.draw('diagonal', 'transparent', resolvedFillColor, 5);
    return {
      fill: true,
      backgroundColor,
      pointBackgroundColor: pointColor || backgroundColor,
    };
  }
  return { pointBackgroundColor: pointColor || lineColor };
};
