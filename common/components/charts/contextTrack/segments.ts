import type { AnnotationOptions, AnnotationTypeRegistry } from 'chartjs-plugin-annotation';
import dayjs from 'dayjs';
import type { OldAlert } from '../../../types/alerts';
import { FIVE_MINUTES } from '../../../constants/time';
import { hexWithAlpha } from '../../../utils/general';
import { annotationTooltip } from '../annotationTooltip';

/** The x scale's range, in epoch milliseconds. */
export interface Domain {
  min: number;
  max: number;
}

export interface Span {
  start: number;
  end: number;
}

export const ALERT_COLOR = '#eab308';
const ALERT_SHADING = hexWithAlpha('#fef08a', 0.5);

const FORMAT = 'YYYY-MM-DDTHH:mm:ss';

/** Where `time` falls across the domain, from 0 to 1. */
export const toFraction = (time: number, { min, max }: Domain) =>
  max > min ? Math.min(Math.max((time - min) / (max - min), 0), 1) : 0;

/** Assigns each span the first lane it doesn't overlap, so overlapping spans stack. */
export const packLanes = <T extends Span>(spans: T[]): (T & { lane: number })[] => {
  const laneEnds: number[] = [];
  return [...spans]
    .sort((a, b) => a.start - b.start)
    .map((span) => {
      let lane = laneEnds.findIndex((end) => end <= span.start);
      if (lane === -1) lane = laneEnds.length;
      laneEnds[lane] = span.end;
      return { ...span, lane };
    });
};

export const formatTimeRange = (start: string, end: string, daily = false) => {
  const from = dayjs(start);
  const to = dayjs(end);
  if (daily) {
    const last = to.subtract(1, 'day');
    return last.isSame(from, 'day')
      ? from.format('ddd, MMM D')
      : `${from.format('MMM D')} – ${last.format('MMM D')}`;
  }
  if (to.diff(from, 'hour') >= 24) return 'All day';
  return `${from.format('h:mm A')} – ${to.format('h:mm A')}`;
};

export const alertKey = (alert: OldAlert) =>
  `alert|${alert.valid_from}|${alert.valid_to}|${alert.text}`;

/**
 * The span the single-day charts always show, 5:30 AM to 1:15 AM the next morning. Anything drawn
 * past it would stretch the x axis, since datasets and annotations widen the scales they sit on.
 */
export const serviceDay = (date: string) => {
  const day = dayjs(date);
  return {
    open: day.set('hour', 5).set('minute', 30),
    close: day.add(1, 'day').set('hour', 1).set('minute', 15),
  };
};

/**
 * The single-day x axis: from five minutes before the first trip (or 6 AM, if earlier) to the last
 * trip (or 1:15 AM, if later). Set from the trips alone so temperature, shading and alerts that
 * run past the trips get clipped at the plot's edges instead of stretching it.
 */
export const singleDayAxisBounds = (date: string, times: string[]): Domain => {
  const day = dayjs(date);
  const parsed = times.map((time) => dayjs(time).valueOf()).filter(Number.isFinite);
  const earliest = day.set('hour', 6).valueOf();
  const latest = serviceDay(date).close.valueOf();
  return {
    min: Math.min(earliest, ...parsed.map((time) => time - FIVE_MINUTES)),
    max: Math.max(latest, ...parsed),
  };
};

/** Clips an alert to the service day, or returns null when it falls outside it. */
export const clipAlert = (alert: OldAlert, date: string) => {
  const { open, close } = serviceDay(date);
  const from = dayjs(alert.valid_from);
  const to = dayjs(alert.valid_to);
  const start = from.isBefore(open) ? open : from;
  const end = to.isAfter(close) ? close : to;
  // Outside the service day entirely
  if (!start.isBefore(end)) return null;
  return { from: start.format(FORMAT), to: end.format(FORMAT) };
};

export const alertSegments = (alerts: OldAlert[], date: string) =>
  packLanes(
    alerts.flatMap((alert) => {
      const clipped = clipAlert(alert, date);
      if (!clipped) return [];
      return [
        {
          alert,
          key: alertKey(alert),
          start: dayjs(clipped.from).valueOf(),
          end: dayjs(clipped.to).valueOf(),
        },
      ];
    })
  );

export const getAlertAnnotations = (
  alerts: OldAlert[],
  date: string
): AnnotationOptions<keyof AnnotationTypeRegistry>[] =>
  alerts.flatMap((alert) => {
    const clipped = clipAlert(alert, date);
    if (!clipped) return [];
    return {
      type: 'box' as const,
      xMin: clipped.from,
      xMax: clipped.to,
      backgroundColor: ALERT_SHADING,
      borderColor: 'transparent',
      ...annotationTooltip({
        title: formatTimeRange(alert.valid_from, alert.valid_to),
        lines: [alert.text],
      }),
    };
  });
