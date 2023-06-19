import type { AggregateDataPoint, SingleDayDataPoint } from '../types/charts';

export const averageDwells = (dwells: SingleDayDataPoint[] | AggregateDataPoint[]) => {
  if (!(dwells.length >= 1)) {
    return 0;
  }
  const totalDwell = dwells
    .map((trip: SingleDayDataPoint | AggregateDataPoint) =>
      'mean' in trip ? trip.mean : trip.dwell_time_sec
    )
    .reduce((total: number, dwell) => {
      if (dwell) return total + dwell;
    }, 0);
  return (totalDwell || 0) / dwells.length;
};

export const longestDwells = (dwells: SingleDayDataPoint[] | AggregateDataPoint[]) => {
  if (!(dwells.length >= 1)) {
    return 0;
  }
  const allDwells = dwells
    .map((trip: SingleDayDataPoint | AggregateDataPoint) =>
      'max' in trip ? trip.max : trip.dwell_time_sec
    )
    .filter((dwell) => dwell !== undefined) as number[];
  return Math.max(...allDwells);
};

export const getLongestDwell = (dwells: AggregateDataPoint[]) => {
  return dwells.reduce(
    (current, datapoint) => (datapoint.max > current.max ? datapoint : current),
    dwells[0]
  );
};

const getLongestDwellSingle = (dwells: SingleDayDataPoint[]) => {
  return dwells.reduce((current, datapoint) => {
    if (datapoint.dwell_time_sec && current.dwell_time_sec)
      return datapoint.dwell_time_sec > current.dwell_time_sec ? datapoint : current;
    return current;
  }, dwells[0]);
};

const getShortestDwellSingle = (dwells: SingleDayDataPoint[]) => {
  return dwells.reduce((current, datapoint) => {
    if (datapoint.dwell_time_sec && current.dwell_time_sec)
      return datapoint.dwell_time_sec < current.dwell_time_sec ? datapoint : current;
    return current;
  }, dwells[0]);
};

export const getDwellsAggregateWidgetData = (dwells: AggregateDataPoint[]) => {
  return { average: averageDwells(dwells), max: getLongestDwell(dwells) };
};

export const getDwellsSingleWidgetData = (dwells: SingleDayDataPoint[]) => {
  return {
    average: averageDwells(dwells),
    longest: getLongestDwellSingle(dwells),
    shortest: getShortestDwellSingle(dwells),
  };
};
