import type { MiniWidgetObject } from '../components/widgets/MiniWidgetCreator';
import { MPHWidgetValue, PercentageWidgetValue, TimeWidgetValue } from '../types/basicWidgets';
import {
  BenchmarkFieldKeys,
  type AggregateDataPoint,
  type SingleDayDataPoint,
  MetricFieldKeys,
} from '../types/charts';
import type { DataPoint } from '../types/dataPoints';

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

const getBunchedPercentage = (data: SingleDayDataPoint[]) => {
  const bunchedPoints = data.map((point: DataPoint) => {
    const ratio =
      point[MetricFieldKeys.headwayTimeSec] / point[BenchmarkFieldKeys.benchmarkHeadwayTimeSec];
    if (ratio <= 0.5) {
      return 1;
    }
    return 0;
  });
  return bunchedPoints.reduce((a, b) => a + b, 0) / data.length;
};

const getOnTimePercentage = (data: SingleDayDataPoint[]) => {
  const onTimePoints = data.map((point: DataPoint) => {
    const ratio =
      point[MetricFieldKeys.headwayTimeSec] / point[BenchmarkFieldKeys.benchmarkHeadwayTimeSec];
    if (ratio > 0.75 && ratio < 1.25) {
      return 1;
    }
    return 0;
  });
  return onTimePoints.reduce((a, b) => a + b, 0) / data.length;
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

const getAggHeadwayDataPoints = (aggData: AggregateDataPoint[]) => {
  const totalTrips = aggData.map((tt) => tt.count).reduce((a, b) => a + b, 0);
  const bunchedTrips = aggData.map((tt) => tt.bunched).reduce((a = 0, b = 0) => a + b, 0) || 0;
  const onTimeTrips = aggData.map((tt) => tt.on_time).reduce((a = 0, b = 0) => a + b, 0) || 0;

  const bunched = bunchedTrips / totalTrips;
  const onTime = onTimeTrips / totalTrips;

  const { average, min, max, median, p10, p90 } = getAggDataPointsOfInterest(aggData);
  return { average, min, max, median, p10, p90, bunched, onTime };
};

export const getAggDataWidgets = (aggData: AggregateDataPoint[], type: 'times' | 'speeds') => {
  const { average, min, max, median, p10, p90 } = getAggDataPointsOfInterest(aggData);
  return [
    { text: 'Avg', widgetValue: getWidget(type, average), type: 'data' },
    { text: 'Median', widgetValue: getWidget(type, median), type: 'data' },
    { text: '10%', widgetValue: getWidget(type, p10), type: 'data' },
    { text: '90%', widgetValue: getWidget(type, p90), type: 'data' },
    { text: 'Min', widgetValue: getWidget(type, min), type: 'data' },
    { text: 'Max', widgetValue: getWidget(type, max), type: 'data' },
  ];
};

export const getAggHeadwayDataWidgets = (aggData: AggregateDataPoint[], type: 'times') => {
  const { average, min, max, median, p10, p90, bunched, onTime } = getAggHeadwayDataPoints(aggData);
  return [
    { text: 'Avg', widgetValue: getWidget(type, average), type: 'data' },
    { text: 'Median', widgetValue: getWidget(type, median), type: 'data' },
    { text: '10%', widgetValue: getWidget(type, p10), type: 'data' },
    { text: '90%', widgetValue: getWidget(type, p90), type: 'data' },
    { text: 'Min', widgetValue: getWidget(type, min), type: 'data' },
    { text: 'Max', widgetValue: getWidget(type, max), type: 'data' },
    { text: 'Bunched Trips', widgetValue: new PercentageWidgetValue(bunched), type: 'data' },
    { text: 'On Time Trips', widgetValue: new PercentageWidgetValue(onTime), type: 'data' },
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
  const onTimePercentage = getOnTimePercentage(data);
  const bunchedPercentage = getBunchedPercentage(data);
  return { max, min, median, average, p10, p90, onTimePercentage, bunchedPercentage };
};

function getWidget(type: string, value: number | undefined) {
  if (type === 'speeds') {
    return new MPHWidgetValue(value);
  } else {
    return new TimeWidgetValue(value);
  }
}

export const getSingleDayWidgets = (
  data: SingleDayDataPoint[],
  type: 'traveltimes' | 'dwells' | 'headways' | 'speeds'
): MiniWidgetObject[] => {
  const { max, min, median, average, p10, p90, onTimePercentage, bunchedPercentage } =
    getSingleDayPointsOfInterest(data, type);

  const widgets: MiniWidgetObject[] = [
    { text: 'Avg', widgetValue: getWidget(type, average), type: 'data' },
    { text: 'Median', widgetValue: getWidget(type, median), type: 'data' },
    { text: '10%', widgetValue: getWidget(type, p10), type: 'data' },
    { text: '90%', widgetValue: getWidget(type, p90), type: 'data' },
    { text: 'Min', widgetValue: getWidget(type, min), type: 'data' },
    { text: 'Max', widgetValue: getWidget(type, max), type: 'data' },
  ];

  if (type === 'headways') {
    widgets.push({
      text: 'On Time Trips',
      widgetValue: new PercentageWidgetValue(onTimePercentage),
      type: 'data',
    });
    widgets.push({
      text: 'Bunched Trips',
      widgetValue: new PercentageWidgetValue(bunchedPercentage),
      type: 'data',
    });
  }

  return widgets;
};
