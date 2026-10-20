import dayjs from 'dayjs';
import {
  DATE_FORMAT,
  FERRY_ARCHIVE_MAX_DATE,
  FERRY_ARRIVALS_START_DATE,
  FERRY_LIVE_START_DATE,
  PRETTY_DATE_FORMAT,
  TODAY_STRING,
} from '../constants/dates';
import type { QueryParams, Tab } from '../types/router';

type DateQuery = Pick<QueryParams, 'date' | 'startDate' | 'endDate'>;

export type TripMetric = 'traveltimes' | 'headways' | 'dwells';

interface CoverageGap {
  /** First and last missing days, inclusive. */
  start: string;
  end: string;
  /** What's missing, e.g. "Ferry data". */
  label: string;
  /** Only these charts are affected; all trip charts when omitted. */
  metrics?: TripMetric[];
  /** Short clause for the page-level notice. */
  because: string;
  /** Full explanation for an empty chart. */
  why: string;
}

const dayAfter = (date: string) => dayjs(date).add(1, 'day').format(DATE_FORMAT);
const dayBefore = (date: string) => dayjs(date).subtract(1, 'day').format(DATE_FORMAT);
const pretty = (date: string) => dayjs(date).format(PRETTY_DATE_FORMAT);
const prettySpan = (start: string, end: string, separator = ' to ') =>
  `${dayjs(start).format(dayjs(start).year() === dayjs(end).year() ? 'MMM D' : PRETTY_DATE_FORMAT)}${separator}${pretty(end)}`;

const FERRY_ARCHIVE_WHY = `The MBTA's ferry archive runs through ${pretty(FERRY_ARCHIVE_MAX_DATE)}`;

/**
 * Date spans where we know a mode has no trip data, so an empty trip chart isn't the user's fault.
 * A metric-specific gap is listed before any wider one that overlaps it, so it wins.
 */
export const COVERAGE_GAPS: Partial<Record<Tab, CoverageGap[]>> = {
  Ferry: [
    {
      start: dayAfter(FERRY_ARCHIVE_MAX_DATE),
      end: dayBefore(FERRY_ARRIVALS_START_DATE),
      label: 'Ferry travel times',
      metrics: ['traveltimes'],
      because: 'until TransitMatters began recording ferry arrivals',
      why: `${FERRY_ARCHIVE_WHY}, and TransitMatters began recording the ferry arrivals travel times need on ${pretty(FERRY_ARRIVALS_START_DATE)}.`,
    },
    {
      start: dayAfter(FERRY_ARCHIVE_MAX_DATE),
      end: dayBefore(FERRY_LIVE_START_DATE),
      label: 'Ferry data',
      because:
        "between the end of the MBTA's archive and the start of TransitMatters' own recording",
      why: `${FERRY_ARCHIVE_WHY}, and TransitMatters began recording ferry trips on ${pretty(FERRY_LIVE_START_DATE)}.`,
    },
  ],
};

const toSpan = ({ date, startDate, endDate }: DateQuery) =>
  date
    ? { start: date, end: date }
    : startDate && endDate
      ? { start: startDate, end: endDate }
      : null;

const covers = (gap: CoverageGap, span: { start: string; end: string }) =>
  gap.start <= span.start && span.end <= gap.end;

const appliesTo = (gap: CoverageGap, metric?: TripMetric) =>
  !gap.metrics || (metric !== undefined && gap.metrics.includes(metric));

/** The gap that wholly contains the selected dates for this chart, if any. */
const gapContaining = (tab: Tab, dates: DateQuery, metric?: TripMetric) => {
  const span = toSpan(dates);
  if (!span) return undefined;
  return COVERAGE_GAPS[tab]?.find((gap) => appliesTo(gap, metric) && covers(gap, span));
};

/** Gaps that cut into the selected range without covering all of it, so some charts have a hole. */
export const getPartialCoverageGaps = (tab: Tab, dates: DateQuery) => {
  const span = toSpan(dates);
  if (!span) return [];
  return (COVERAGE_GAPS[tab] ?? []).filter(
    (gap) => gap.start <= span.end && span.start <= gap.end && !covers(gap, span)
  );
};

export const describeGap = (gap: CoverageGap) =>
  `${gap.label} ${gap.label.endsWith('s') ? 'are' : 'is'} missing from ${prettySpan(gap.start, gap.end)}, ${gap.because}.`;

/** The same selection moved to just after the gap: one day, or a range of the same length capped at today. */
const jumpPastGap = (gap: CoverageGap, dates: DateQuery, today: string) => {
  const start = dayAfter(gap.end);
  if (dates.date) return { jumpTo: { date: start }, jumpLabel: `Show ${pretty(start)}` };

  const length = dayjs(dates.endDate).diff(dates.startDate, 'day');
  let end = dayjs(start).add(length, 'day').format(DATE_FORMAT);
  if (end > today) end = today;
  if (end <= start) return undefined;
  return {
    jumpTo: { startDate: start, endDate: end },
    jumpLabel: `Show ${prettySpan(start, end, ' – ')}`,
  };
};

interface NoDataContext extends DateQuery {
  tab: Tab;
  /** The trip chart that came back empty, for gaps that only affect some charts. */
  metric?: TripMetric;
  /** The chart covers a whole line rather than a station pair. */
  isLineMetric?: boolean;
  /** The query returned data, but the chart's day or peak filter removed all of it. */
  filtered?: boolean;
  today?: string;
}

export interface NoDataReason {
  title: string;
  detail: string;
  jumpTo?: DateQuery;
  jumpLabel?: string;
}

/** Why a chart came back empty, as specifically as we can tell without another request. */
export const getNoDataReason = ({
  tab,
  metric,
  date,
  startDate,
  endDate,
  isLineMetric = false,
  filtered = false,
  today = TODAY_STRING,
}: NoDataContext): NoDataReason => {
  const dates = { date, startDate, endDate };

  if (filtered) {
    return {
      title: 'Nothing matches this filter',
      detail: 'There is data for these dates, but none for the selected days or times.',
    };
  }

  // The gaps are in trip events; line-wide metrics like ridership come from elsewhere.
  const gap = isLineMetric ? undefined : gapContaining(tab, dates, metric);
  if (gap) {
    return {
      title: `No ${gap.label.toLowerCase()} for ${date ? 'this day' : 'these dates'}`,
      detail: gap.why,
      ...jumpPastGap(gap, dates, today),
    };
  }

  if (date && date === today) {
    return {
      title: 'No trips recorded yet today',
      detail: 'Data arrives with a delay of up to two hours, so recent trips may not show yet.',
      jumpTo: { date: dayBefore(today) },
      jumpLabel: 'Show yesterday',
    };
  }

  if (isLineMetric) {
    return { title: 'No data available', detail: 'Try another date range.' };
  }

  switch (tab) {
    case 'Ferry':
      return {
        title: 'No ferry trips recorded',
        detail:
          'Some ferry routes and stops run only seasonally or on weekdays. Try another stop pair or date.',
      };
    case 'Bus':
      return {
        title: 'No bus trips recorded',
        detail:
          "Bus tracking can miss trips, and some routes don't run every day. Try another stop pair or date.",
      };
    case 'Commuter Rail':
      return {
        title: 'No trains recorded',
        detail:
          'Commuter Rail data is in beta and can miss trips, and many trains skip some stations. Try another station pair or date.',
      };
    default:
      return {
        title: 'No data available',
        detail: 'Try another station pair or date range.',
      };
  }
};
