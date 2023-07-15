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
    low: data[0],
    high: data[data.length - 1],
    median: data[Math.round(data.length / 2)],
    first: first,
    last: last,
  };
};

const getAggDataPointsOfInterest = (aggData: AggregateDataPoint[]) => {
  const medianData = aggData.map((tt) => tt['50%']);
  const { low, high, median, first, last } = getPeaks(medianData);
  const average = getAverage(medianData);
  return { average, low, high, median, first, last };
};

export const getAggDataWidgets = (aggData: AggregateDataPoint[]) => {
  const { average, low, high, median, first, last } = getAggDataPointsOfInterest(aggData);
  return [
    { text: 'Avg', widgetValue: new TimeWidgetValue(average), type: 'data' },
    {
      text: 'From start',
      widgetValue: new TimeWidgetValue(
        last !== undefined && first !== undefined ? last - first : undefined
      ),
      type: 'delta',
    },

    { text: 'Low', widgetValue: new TimeWidgetValue(low), type: 'data' },
    {
      text: 'From Low',
      widgetValue: new TimeWidgetValue(
        last !== undefined && low !== undefined ? last - low : undefined
      ),
      type: 'delta',
    },

    { text: 'High', widgetValue: new TimeWidgetValue(high), type: 'data' },
    {
      text: 'From High',
      widgetValue: new TimeWidgetValue(
        last !== undefined && high !== undefined ? last - high : undefined
      ),
      type: 'delta',
    },
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
  const { high, low, median } = getPeaks(_data);
  const average = getAverage(_data);
  return { high, low, median, average };
};

export const getSingleDayWidgets = (
  data: SingleDayDataPoint[],
  type: 'traveltimes' | 'dwells' | 'headways'
) => {
  const { high, low, median, average } = getSingleDayPointsOfInterest(data, type);
  return [
    { text: 'Avg', widgetValue: new TimeWidgetValue(average), type: 'data' },
    { text: 'Median', widgetValue: new TimeWidgetValue(median), type: 'data' },
    { text: 'Low', widgetValue: new TimeWidgetValue(low), type: 'data' },
    { text: 'High', widgetValue: new TimeWidgetValue(high), type: 'data' },
  ];
};
