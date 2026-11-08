import type { AnnotationOptions, AnnotationTypeRegistry } from 'chartjs-plugin-annotation';
import dayjs from 'dayjs';
import type { Block } from '../../../common/components/charts/TimeSeriesChart';
import { CHART_COLORS } from '../../../common/constants/colors';
import {
  TODAY,
  OVERVIEW_TRAIN_MIN_DATE,
  DATE_FORMAT,
  PRETTY_DATE_FORMAT,
} from '../../../common/constants/dates';

const shuttlingAnnotationBlockStyle = {
  backgroundColor: CHART_COLORS.BLOCKS,
  borderWidth: 0,
  label: {
    content: 'No data',
    rotation: -90,
    color: 'white',
    display: true,
  },
};

/*
 * This function return ChartJS annotations for date ranges where we do not have data.
 * The range is the datapoint before and after the dates we do not have data, since that makes the block align visually.
 * We use datapoint.value as the determination as to whether there is data. It is set to null when shuttling occurs throughout a day.
 *
 * `hasData` defaults to miles_covered, which is the right signal for service and speed.
 * Charts of a different metric should pass their own: a partial shutdown zeroes the
 * line's service metrics while other metrics may still have been measured on the
 * branches that kept running.
 */
export const getShuttlingBlockAnnotations = <T extends { date: string; miles_covered?: number }>(
  data: T[],
  hasData: (datapoint: T) => boolean = (datapoint) => Boolean(datapoint.miles_covered)
): AnnotationOptions<keyof AnnotationTypeRegistry>[] => {
  let xMin: string | undefined;
  let xMax: string | undefined;
  let insideShuttlingBlock = false;
  const dateBlocks: AnnotationOptions<keyof AnnotationTypeRegistry>[] = [];
  data.forEach((datapoint, index) => {
    if (!hasData(datapoint)) {
      if (!insideShuttlingBlock) xMin = index > 0 ? data[index - 1].date : undefined;
      xMax = index + 1 < data.length ? data[index + 1].date : undefined;
      insideShuttlingBlock = true;
    }
    if (insideShuttlingBlock && (hasData(datapoint) || index + 1 === data.length)) {
      dateBlocks.push({
        type: 'box',
        xMin: xMin,
        xMax: xMax,
        ...shuttlingAnnotationBlockStyle,
      });
      insideShuttlingBlock = false;
    }
  });
  return dateBlocks;
};

/*
 * This function return ChartJS annotations from a date to TODAY.
 * Great for datasets that are delivered with a week or month delay
 */
export const getRemainingBlockAnnotation = (
  xMin: string | undefined = OVERVIEW_TRAIN_MIN_DATE,
  xMax: string | undefined = TODAY.toString()
): AnnotationOptions<keyof AnnotationTypeRegistry>[] => {
  return [
    {
      type: 'box',
      xMin: xMin,
      xMax: xMax,
      ...shuttlingAnnotationBlockStyle,
    },
  ];
};

// Data normally trails today by up to a couple of days of processing.
const EXPECTED_LAG_DAYS = 2;

/*
 * The latest date, but only when the data stops short of `end` by more than one bucket plus the
 * usual lag, so data that is just catching up doesn't get a sliver of "No data" at the edge.
 * The bucket is the spacing of the last two dates, which covers daily, weekly and monthly data.
 */
const getStaleLatestDate = (dates: string[], end: string) => {
  const sorted = [...new Set(dates)].sort();
  const latest = sorted.at(-1);
  if (!latest) return undefined;
  const previous = sorted.at(-2);
  const bucketDays = previous ? Math.max(dayjs(latest).diff(previous, 'day'), 1) : 1;
  return dayjs(end).diff(latest, 'day') > bucketDays + EXPECTED_LAG_DAYS ? latest : undefined;
};

/*
 * A "No data" block from the latest datapoint through today when the data has fallen behind,
 * so it reads as not yet available rather than a line that just stops.
 * Pass `until` to stop the block early, e.g. where a "Service ended" block takes over.
 */
export const getNoDataSinceLatestAnnotation = (
  dates: string[],
  until?: string,
  today: string = TODAY.format(DATE_FORMAT)
) => {
  const latest = getStaleLatestDate(dates, until ?? today);
  if (!latest) return [];
  return getRemainingBlockAnnotation(latest, until);
};

// The same block, for TimeSeriesChart.
export const getNoDataSinceLatestBlock = (
  dates: string[],
  today: string = TODAY.format(DATE_FORMAT)
): Block[] => {
  const latest = getStaleLatestDate(dates, today);
  return latest ? [{ from: latest, to: today }] : [];
};

/*
 * This function returns ChartJS annotations covering the parts of a date range before a route's
 * service started or after it ended, so those gaps read as expected rather than as missing data.
 */
export const getServiceDatesBlockAnnotations = (
  startDate: string,
  endDate: string,
  serviceStart: string | undefined,
  serviceEnd: string | undefined
): AnnotationOptions<keyof AnnotationTypeRegistry>[] => {
  const dateBlocks: AnnotationOptions<keyof AnnotationTypeRegistry>[] = [];
  if (serviceStart && dayjs(serviceStart).isAfter(startDate)) {
    dateBlocks.push({
      type: 'box',
      xMin: startDate,
      xMax: dayjs(serviceStart).isBefore(endDate) ? serviceStart : endDate,
      ...shuttlingAnnotationBlockStyle,
      label: {
        ...shuttlingAnnotationBlockStyle.label,
        content: `Service began ${dayjs(serviceStart).format(PRETTY_DATE_FORMAT)}`,
      },
    });
  }
  if (serviceEnd && dayjs(serviceEnd).isBefore(endDate)) {
    dateBlocks.push({
      type: 'box',
      xMin: dayjs(serviceEnd).isAfter(startDate) ? serviceEnd : startDate,
      xMax: endDate,
      ...shuttlingAnnotationBlockStyle,
      label: {
        ...shuttlingAnnotationBlockStyle.label,
        content: `Service ended ${dayjs(serviceEnd).format(PRETTY_DATE_FORMAT)}`,
      },
    });
  }
  return dateBlocks;
};
