import { MPHWidgetValue, TimeWidgetValue } from '../types/basicWidgets';
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
  data.sort((a, b) => {
    if (b !== undefined && a !== undefined) return a - b;
    return 0;
  });
  return {
    min: data[0],
    max: data[data.length - 1],
    median: data[Math.round(data.length / 2)],
    p10: data[Math.floor(data.length / 10)],
    p90: data[Math.floor(9 * (data.length / 10))],
  };
};

const getAggDataPointsOfInterest = (aggData: AggregateDataPoint[]) => {
  const medianData = aggData.map((tt) => tt['50%']);
  const { min, max, median, p10, p90 } = getPeaks(medianData);
  const average = getAverage(medianData);
  return { average, min, max, median, p10, p90 };
};

export const getAggDataWidgets = (aggData: AggregateDataPoint[]) => {
  const { average, min, max, median, p10, p90 } = getAggDataPointsOfInterest(aggData);
  return [
    { text: 'Avg', widgetValue: new TimeWidgetValue(average), type: 'data' },
    { text: 'Median', widgetValue: new TimeWidgetValue(median), type: 'data' },
    { text: '10%', widgetValue: new TimeWidgetValue(p10), type: 'data' },
    { text: '90%', widgetValue: new TimeWidgetValue(p90), type: 'data' },
    { text: 'Min', widgetValue: new TimeWidgetValue(min), type: 'data' },
    { text: 'Max', widgetValue: new TimeWidgetValue(max), type: 'data' },
  ];
};

const getSingleDayNumberArray = (
  data: SingleDayDataPoint[],
  type: 'traveltimes' | 'dwells' | 'headways' | 'speeds'
) => {
  if (type === 'traveltimes') return data.map((data) => data.travel_time_sec);
  if (type === 'speeds') return data.map((data) => data.speed_mph);
  if (type === 'dwells') return data.map((data) => data.dwell_time_sec);
  if (type === 'headways') return data.map((data) => data.headway_time_sec);
  return [];
};

const getSingleDayPointsOfInterest = (
  data: SingleDayDataPoint[],
  type: 'traveltimes' | 'dwells' | 'headways' | 'speeds'
) => {
  const _data = getSingleDayNumberArray(data, type);
  const { max, min, median, p10, p90 } = getPeaks(_data);
  const average = getAverage(_data);
  return { max, min, median, average, p10, p90 };
};

export const getWidget = (
  type: 'traveltimes' | 'dwells' | 'headways' | 'speeds',
  value: number | undefined
) => {
  if (type === 'speeds') {
    return new MPHWidgetValue(value);
  } else {
    return new TimeWidgetValue(value);
  }
};

export const getSingleDayWidgets = (
  data: SingleDayDataPoint[],
  type: 'traveltimes' | 'dwells' | 'headways' | 'speeds'
) => {
  const { max, min, median, average, p10, p90 } = getSingleDayPointsOfInterest(data, type);
  return [
    { text: 'Avg', widgetValue: getWidget(type, average), type: 'data' },
    { text: 'Median', widgetValue: getWidget(type, median), type: 'data' },
    { text: '10%', widgetValue: getWidget(type, p10), type: 'data' },
    { text: '90%', widgetValue: getWidget(type, p90), type: 'data' },
    { text: 'Min', widgetValue: getWidget(type, min), type: 'data' },
    { text: 'Max', widgetValue: getWidget(type, max), type: 'data' },
  ];
};
