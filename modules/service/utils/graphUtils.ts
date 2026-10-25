import type { AnnotationOptions, AnnotationTypeRegistry } from 'chartjs-plugin-annotation';
import dayjs from 'dayjs';
import type { Block } from '../../../common/components/charts/TimeSeriesChart';
import { CHART_COLORS } from '../../../common/constants/colors';
import type { AlertForModal } from '../../../common/types/alerts';
import { hexWithAlpha } from '../../../common/utils/general';
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

const alertAnnotationBlockStyle = {
  backgroundColor: hexWithAlpha('#fef08a', 0.5),
  borderColor: 'transparent',
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

const getLatestDate = (dates: string[]) =>
  dates.reduce<string | undefined>(
    (latest, date) => (!latest || date > latest ? date : latest),
    undefined
  );

/*
 * A "No data" block from the latest datapoint through today, so data that lags behind
 * (weekly data especially) reads as not yet available rather than a line that just stops.
 * Pass `until` to stop the block early, e.g. where a "Service ended" block takes over.
 */
export const getNoDataSinceLatestAnnotation = (dates: string[], until?: string) => {
  const latest = getLatestDate(dates);
  if (!latest || (until && !dayjs(latest).isBefore(until))) return [];
  return getRemainingBlockAnnotation(latest, until);
};

// The same block, for TimeSeriesChart.
export const getNoDataSinceLatestBlock = (dates: string[]): Block[] => {
  const latest = getLatestDate(dates);
  return latest ? [{ from: latest, to: TODAY.format(DATE_FORMAT) }] : [];
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

export const getAlertAnnotations = (alerts: AlertForModal[], date: string) => {
  const dateBlocks: AnnotationOptions<keyof AnnotationTypeRegistry>[] = [];
  const ESTDate = dayjs(date);
  alerts.forEach((alert) => {
    const from = dayjs(alert.valid_from).isBefore(ESTDate.set('hour', 5).set('minute', 30))
      ? ESTDate.set('hour', 5).set('minute', 30).format('YYYY-MM-DDTHH:mm:ss')
      : alert.valid_from;
    const to = dayjs(alert.valid_to).isAfter(ESTDate.add(1, 'day').set('hour', 1).set('minute', 0))
      ? ESTDate.add(1, 'day').set('hour', 1).set('minute', 0).format('YYYY-MM-DDTHH:mm:ss')
      : alert.valid_to;
    dateBlocks.push({
      type: 'box',
      xMin: alert ? from : undefined,
      xMax: alert ? to : undefined,
      ...alertAnnotationBlockStyle,
    });
  });
  return dateBlocks;
};
