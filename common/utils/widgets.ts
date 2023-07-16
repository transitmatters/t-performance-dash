import { TimeWidgetValue } from '../types/basicWidgets';
import type { AggregateDataPoint, SingleDayDataPoint } from '../types/charts';

const getAverage = (data: (number | undefined)[]) => {
  const { length } = data;
  if (data && length >= 1) {
    const totalSum = data.reduce((a, b) => {
      if (a !== undefined && b !== undefined) {
        return a + b;
      } else {
        return a;
      }
    }, 0);
    return (totalSum || 0) / length;
  } else {
    return 0;
  }
};

const getPeaks = (data: (number | undefined)[]) => {
  const first = data[0];
  const last = data[data.length - 1];
  data.sort();
  return {
    min: data[0],
    max: data[data.length - 1],
    median: data[Math.round(data.length / 2)],
    first: first,
    last: last,
  };
};

const getAggDataPointsOfInterest = (aggData: AggregateDataPoint[]) => {
  const medianData = aggData.map((tt) => tt['50%']);
  const { min, max, median, first, last } = getPeaks(medianData);
  const average = getAverage(medianData);
  return { average, min, max, median, first, last };
};

export const getAggDataWidgets = (aggData: AggregateDataPoint[]) => {
  const { average, min, max, median, first, last } = getAggDataPointsOfInterest(aggData);
  return [
    { text: 'Avg', widgetValue: new TimeWidgetValue(average), type: 'data' },
    { text: 'Median', widgetValue: new TimeWidgetValue(median), type: 'data' },
    { text: 'Min', widgetValue: new TimeWidgetValue(min), type: 'data' },
    { text: 'Max', widgetValue: new TimeWidgetValue(max), type: 'data' },
  ];
};

const getSingleDayNumberArray = (
  data: SingleDayDataPoint[],
  type: 'traveltimes' | 'dwells' | 'headways'
) => {
  if (type === 'traveltimes') return data.map((data) => data.travel_time_sec);
  if (type === 'dwells') return data.map((data) => data.dwell_time_sec);
  if (type === 'headways') return data.map((data) => data.headway_time_sec);
  return [];
};

const getSingleDayPointsOfInterest = (
  data: SingleDayDataPoint[],
  type: 'traveltimes' | 'dwells' | 'headways'
) => {
  const _data = getSingleDayNumberArray(data, type);
  const { max, min, median } = getPeaks(_data);
  const average = getAverage(_data);
  return { max, min, median, average };
};

export const getSingleDayWidgets = (
  data: SingleDayDataPoint[],
  type: 'traveltimes' | 'dwells' | 'headways'
) => {
  const { max, min, median, average } = getSingleDayPointsOfInterest(data, type);
  return [
    { text: 'Avg', widgetValue: new TimeWidgetValue(average), type: 'data' },
    { text: 'Median', widgetValue: new TimeWidgetValue(median), type: 'data' },
    { text: 'Min', widgetValue: new TimeWidgetValue(max), type: 'data' },
    { text: 'Max', widgetValue: new TimeWidgetValue(min), type: 'data' },
  ];
};
