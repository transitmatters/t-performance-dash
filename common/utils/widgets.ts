import type { MiniWidgetObject, WidgetComparison } from '../components/widgets/MiniWidgetCreator';
import { MPHWidgetValue, PercentageWidgetValue, TimeWidgetValue } from '../types/basicWidgets';
import type { DayFilter } from '../types/charts';
import {
  BenchmarkFieldKeys,
  type AggregateDataPoint,
  type SingleDayDataPoint,
  MetricFieldKeys,
} from '../types/charts';
import type { DataPoint } from '../types/dataPoints';
import { BUNCHED_RATIO, isOnTimeHeadwayRatio } from './chartTheme';

const BUNCHED_HEADWAYS =
  'Share of headways at this stop that were half the scheduled headway or less. Headways with no scheduled headway are left out.';
const ON_TIME_HEADWAYS =
  'Share of headways at this stop within 25% of the scheduled headway. Headways with no scheduled headway are left out.';

const getAverage = (data: (number | undefined)[]) => {
  // Filter out undefined, null, NaN, and non-finite values
  const validData = data.filter(
    (val) => val !== undefined && val !== null && typeof val === 'number' && Number.isFinite(val)
  ) as number[];

  if (validData.length >= 1) {
    const totalSum = validData.reduce((a, b) => a + b, 0);
    return totalSum / validData.length;
  }
  return 0;
};

/**
 * Share of the headways with a scheduled headway whose ratio to it matches. Headways with no
 * schedule are left out, and it's undefined when none has one.
 */
const getHeadwayShare = (data: SingleDayDataPoint[], matches: (ratio: number) => boolean) => {
  const scheduled = data.filter((point: DataPoint) =>
    Boolean(point[BenchmarkFieldKeys.benchmarkHeadwayTimeSec])
  );
  if (scheduled.length === 0) return undefined;
  const matching = scheduled.filter((point: DataPoint) =>
    matches(
      point[MetricFieldKeys.headwayTimeSec] / point[BenchmarkFieldKeys.benchmarkHeadwayTimeSec]
    )
  );
  return matching.length / scheduled.length;
};

const isBunchedHeadwayRatio = (ratio: number) => ratio <= BUNCHED_RATIO;

/**
 * Share of trips running no more than 25% over their scheduled travel time — the same threshold the
 * chart legend uses for its "25%+ off" band. Running early isn't a failure here, so only the upper
 * bound counts. Returns undefined when the line has no benchmark data to compare against.
 */
const getOnTimeTravelPercentage = (data: SingleDayDataPoint[]) => {
  const comparable = data.filter((point: DataPoint) => {
    const benchmark = point[BenchmarkFieldKeys.benchmarkTravelTimeSec];
    return Boolean(benchmark) && Number.isFinite(point[MetricFieldKeys.travelTimeSec]);
  });
  if (comparable.length === 0) return undefined;
  const onTime = comparable.filter((point: DataPoint) => {
    const ratio =
      point[MetricFieldKeys.travelTimeSec] / point[BenchmarkFieldKeys.benchmarkTravelTimeSec];
    return ratio <= 1.25;
  });
  return onTime.length / comparable.length;
};

const getPeaks = (data: (number | undefined)[]) => {
  // Filter out undefined, null, NaN, and non-finite values
  const validData = data.filter(
    (val) => val !== undefined && val !== null && typeof val === 'number' && Number.isFinite(val)
  ) as number[];

  validData.sort((a, b) => a - b);

  if (validData.length === 0) {
    return { min: undefined, max: undefined, median: undefined, p10: undefined, p90: undefined };
  }

  const mid = Math.floor(validData.length / 2);
  const median = validData.length % 2 ? validData[mid] : (validData[mid - 1] + validData[mid]) / 2;

  return {
    min: validData[0],
    max: validData[validData.length - 1],
    median,
    p10: validData[Math.floor(validData.length / 10)],
    p90: validData[Math.floor(9 * (validData.length / 10))],
  };
};

const getAggDataPointsOfInterest = (aggData: AggregateDataPoint[]) => {
  const medianData = aggData.map((tt) => tt['50%']);
  const { min, max, median, p10, p90 } = getPeaks(medianData);
  const average = getAverage(medianData);
  return { average, min, max, median, p10, p90 };
};

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

const getAggHeadwayDataPoints = (aggData: AggregateDataPoint[]) => {
  // Counts are added up across days rather than averaging daily shares. Responses from before
  // `scheduled` existed fall back to every headway, as the shares used to be counted.
  const scheduledTrips = sum(aggData.map((tt) => tt.scheduled ?? tt.count));
  const bunchedTrips = sum(aggData.map((tt) => tt.bunched ?? 0));
  const onTimeTrips = sum(aggData.map((tt) => tt.on_time ?? 0));

  const bunched = scheduledTrips ? bunchedTrips / scheduledTrips : undefined;
  const onTime = scheduledTrips ? onTimeTrips / scheduledTrips : undefined;

  const { average, min, max, median, p10, p90 } = getAggDataPointsOfInterest(aggData);
  return { average, min, max, median, p10, p90, bunched, onTime };
};

export const filterByDayType = (data: AggregateDataPoint[], type: 'weekday' | 'weekend') => {
  return data.filter((datapoint) => {
    if (!datapoint.service_date) return true;
    const isWeekendOrHoliday = datapoint.holiday || datapoint.weekend;
    return type === 'weekend' ? isWeekendOrHoliday : !isWeekendOrHoliday;
  });
};

export const getComparisonData = (allData: AggregateDataPoint[], dayFilter: DayFilter) => {
  if (dayFilter === 'all') return undefined;
  const oppositeType = dayFilter === 'weekday' ? 'weekend' : 'weekday';
  const oppositeLabel = dayFilter === 'weekday' ? 'weekends & holidays' : 'weekdays';
  const data = filterByDayType(allData, oppositeType);
  if (data.length === 0) return undefined;
  return { data, label: oppositeLabel };
};

const makeComparison = (
  current: number | undefined,
  other: number | undefined,
  label: string,
  unit: WidgetComparison['unit'],
  higherIsBetter?: boolean
): WidgetComparison | undefined => {
  if (current === undefined || other === undefined) return undefined;
  return { delta: current - other, label, unit, higherIsBetter };
};

/**
 * The Bunched and On time cells for a headway chart. They're left out when no headway had a
 * scheduled headway to compare against, rather than showing 0%.
 */
const getHeadwayShareWidgets = (
  bunched: number | undefined,
  onTime: number | undefined,
  comparison?: { bunched: number | undefined; onTime: number | undefined; label: string }
): MiniWidgetObject[] => {
  if (bunched === undefined || onTime === undefined) return [];
  const label = comparison?.label ?? '';
  return [
    {
      text: 'Bunched (≤50%)',
      description: BUNCHED_HEADWAYS,
      widgetValue: new PercentageWidgetValue(bunched),
      type: 'data',
      comparison: makeComparison(bunched, comparison?.bunched, label, 'percentage'),
    },
    {
      text: 'On time (±25%)',
      description: ON_TIME_HEADWAYS,
      widgetValue: new PercentageWidgetValue(onTime),
      type: 'data',
      comparison: makeComparison(onTime, comparison?.onTime, label, 'percentage', true),
    },
  ];
};

export const getAggDataWidgets = (
  aggData: AggregateDataPoint[],
  type: 'times' | 'speeds',
  comparisonData?: { data: AggregateDataPoint[]; label: string }
): MiniWidgetObject[] => {
  const { average, min, max, median, p10, p90 } = getAggDataPointsOfInterest(aggData);
  const comp = comparisonData ? getAggDataPointsOfInterest(comparisonData.data) : undefined;
  const label = comparisonData?.label ?? '';

  return [
    {
      text: 'Average',
      widgetValue: getWidget(type, average),
      type: 'data',
      comparison: comp ? makeComparison(average, comp.average, label, 'time') : undefined,
    },
    {
      text: 'Median',
      widgetValue: getWidget(type, median),
      type: 'data',
      comparison: comp ? makeComparison(median, comp.median, label, 'time') : undefined,
    },
    {
      text: '10%',
      widgetValue: getWidget(type, p10),
      type: 'data',
      comparison: comp ? makeComparison(p10, comp.p10, label, 'time') : undefined,
    },
    {
      text: '90%',
      widgetValue: getWidget(type, p90),
      type: 'data',
      comparison: comp ? makeComparison(p90, comp.p90, label, 'time') : undefined,
    },
    {
      text: 'Min',
      widgetValue: getWidget(type, min),
      type: 'data',
      comparison: comp ? makeComparison(min, comp.min, label, 'time') : undefined,
    },
    {
      text: 'Max',
      widgetValue: getWidget(type, max),
      type: 'data',
      comparison: comp ? makeComparison(max, comp.max, label, 'time') : undefined,
    },
  ];
};

export const getAggHeadwayDataWidgets = (
  aggData: AggregateDataPoint[],
  type: 'times',
  comparisonData?: { data: AggregateDataPoint[]; label: string }
): MiniWidgetObject[] => {
  const { average, min, max, median, p10, p90, bunched, onTime } = getAggHeadwayDataPoints(aggData);
  const comp = comparisonData ? getAggHeadwayDataPoints(comparisonData.data) : undefined;
  const label = comparisonData?.label ?? '';

  return [
    {
      text: 'Average',
      widgetValue: getWidget(type, average),
      type: 'data',
      comparison: comp ? makeComparison(average, comp.average, label, 'time') : undefined,
    },
    {
      text: 'Median',
      widgetValue: getWidget(type, median),
      type: 'data',
      comparison: comp ? makeComparison(median, comp.median, label, 'time') : undefined,
    },
    {
      text: '10%',
      widgetValue: getWidget(type, p10),
      type: 'data',
      comparison: comp ? makeComparison(p10, comp.p10, label, 'time') : undefined,
    },
    {
      text: '90%',
      widgetValue: getWidget(type, p90),
      type: 'data',
      comparison: comp ? makeComparison(p90, comp.p90, label, 'time') : undefined,
    },
    {
      text: 'Min',
      widgetValue: getWidget(type, min),
      type: 'data',
      comparison: comp ? makeComparison(min, comp.min, label, 'time') : undefined,
    },
    {
      text: 'Max',
      widgetValue: getWidget(type, max),
      type: 'data',
      comparison: comp ? makeComparison(max, comp.max, label, 'time') : undefined,
    },
    ...getHeadwayShareWidgets(bunched, onTime, comp && { ...comp, label }),
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
  const { max, min, median, average, p10, p90 } = getSingleDayPointsOfInterest(data, type);

  const widgets: MiniWidgetObject[] = [
    { text: 'Average', widgetValue: getWidget(type, average), type: 'data' },
    { text: 'Median', widgetValue: getWidget(type, median), type: 'data' },
    { text: '10%', widgetValue: getWidget(type, p10), type: 'data' },
    { text: '90%', widgetValue: getWidget(type, p90), type: 'data' },
    { text: 'Min', widgetValue: getWidget(type, min), type: 'data' },
    { text: 'Max', widgetValue: getWidget(type, max), type: 'data' },
  ];

  if (type === 'traveltimes') {
    const onTimeTravel = getOnTimeTravelPercentage(data);
    if (onTimeTravel !== undefined) {
      widgets.push({
        text: 'On Time',
        widgetValue: new PercentageWidgetValue(onTimeTravel),
        type: 'data',
      });
    }
  }

  if (type === 'headways') {
    widgets.push(
      ...getHeadwayShareWidgets(
        getHeadwayShare(data, isBunchedHeadwayRatio),
        getHeadwayShare(data, isOnTimeHeadwayRatio)
      )
    );
  }

  return widgets;
};
