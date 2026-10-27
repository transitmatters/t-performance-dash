import type { AnnotationOptions, AnnotationTypeRegistry } from 'chartjs-plugin-annotation';
import dayjs from 'dayjs';
import type { Block } from '../../../common/components/charts/TimeSeriesChart';
import { annotationTooltip } from '../../../common/components/charts/annotationTooltip';
import { CHART_COLORS } from '../../../common/constants/colors';
import { DATE_FORMAT } from '../../../common/constants/dates';
import { prettyDate } from '../../../common/utils/date';
import { crStations, rtStations } from '../../../common/constants/stations';
import type { CommuterRailRoute, LineShort } from '../../../common/types/lines';
import type { Shutdown, ShutdownEffect } from '../../../common/types/shutdowns';
import type { Station } from '../../../common/types/stations';

type Annotation = AnnotationOptions<keyof AnnotationTypeRegistry>;
type RapidTransitLine = keyof typeof rtStations;

export type ShutdownView = {
  shutdown: Shutdown;
  label: string;
  /** What the chart band says: "Shutdown", or "Partial shutdown" when part of the line kept running. */
  bandLabel: string;
  /** The stations the alert lists, in line order. */
  stations: Station[];
  /** Service days the shutdown took up most of, as inclusive [first, last] ranges. */
  dayRanges: [string, string][];
};

export type ShutdownRange = { startDate?: string; endDate?: string };

const RAPID_TRANSIT_LINES: LineShort[] = ['Red', 'Orange', 'Blue', 'Green', 'Mattapan'];

const EFFECT_LABELS: Record<ShutdownEffect, string> = {
  SHUTTLE: 'Shuttle',
  SUSPENSION: 'Suspended',
  STATION_CLOSURE: 'Closed',
};

// Trains run from about 5am to 1am. A shutdown counts for a day once it takes up half of that, so a
// weekend shutdown that starts Friday evening marks Saturday and Sunday but not Friday.
const SERVICE_START_HOUR = 5;
const SERVICE_END_HOUR = 1;
const MIN_HOURS_FOR_DAY = 10;

// Below this share of the chart's width, a rotated label spills over its neighbors.
const MIN_LABELLED_SHARE = 0.03;

const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

/** The line ID the shutdowns API takes, or undefined for modes it doesn't cover. */
export const shutdownLineId = (
  lineShort: LineShort | undefined,
  crRoute?: CommuterRailRoute
): string | undefined => {
  if (lineShort === 'Commuter Rail') return crRoute;
  return lineShort && RAPID_TRANSIT_LINES.includes(lineShort) ? lineShort : undefined;
};

const stationsForLine = (lineId: string): Station[] =>
  (lineId.startsWith('CR-')
    ? crStations[lineId as CommuterRailRoute]
    : rtStations[lineId as RapidTransitLine]
  )?.stations ?? [];

/** The station a stop belongs to on this line. Alerts list parent stations, child stops, or both. */
export const stationForStop = (lineId: string, stopId: string): Station | undefined =>
  stationsForLine(lineId).find((station) => {
    const stopIds = [...station.stops['0'], ...station.stops['1']];
    // Commuter Rail stop IDs are prefixed with route and direction, e.g. CR-Fairmount_0_DB-2205-01
    return (
      station.station === stopId ||
      stopIds.includes(stopId) ||
      stopIds.some((id) => id.endsWith(`_${stopId}`))
    );
  });

const shutdownStations = (shutdown: Shutdown, lineId: string): Station[] => {
  const byId = new Map<string, Station>();
  shutdown.stops.forEach((stopId) => {
    const station = stationForStop(lineId, stopId);
    if (station) byId.set(station.station, station);
  });
  return [...byId.values()].sort((a, b) => a.order - b.order);
};

// Drops the branch from names like "JFK/UMass (Ashmont)"; the line already says which branch.
const stationName = (station: Station) => station.stop_name.replace(/ \(.*\)$/, '');

export const shutdownLabel = (effect: ShutdownEffect, stations: Station[]): string => {
  const prefix = EFFECT_LABELS[effect] ?? 'Shutdown';
  if (stations.length === 0) return prefix;
  if (effect === 'STATION_CLOSURE' || stations.length === 1) {
    const names =
      stations.length > 2 ? `${stations.length} stations` : stations.map(stationName).join(', ');
    return `${prefix}: ${names}`;
  }
  return `${prefix}: ${stationName(stations[0])}–${stationName(stations[stations.length - 1])}`;
};

// Periods are Eastern times with an offset. Dropping the offset keeps them on the charts'
// Eastern wall-clock axis in any viewer's timezone.
const wallClock = (iso: string) => dayjs(iso.slice(0, 19));

// Set by hour rather than adding hours, so the window keeps its wall-clock times across DST.
const serviceWindow = (day: dayjs.Dayjs) => ({
  start: day.hour(SERVICE_START_HOUR),
  end: day.add(1, 'day').hour(SERVICE_END_HOUR),
});

export const shutdownDays = (shutdown: Shutdown): string[] => {
  const days = new Set<string>();
  shutdown.periods.forEach((period) => {
    const start = wallClock(period.start);
    const end = wallClock(period.end);
    // Service days roll over at 3am
    let day = start.subtract(3, 'hour').startOf('day');
    while (day.isBefore(end)) {
      const service = serviceWindow(day);
      const overlap =
        Math.min(end.valueOf(), service.end.valueOf()) -
        Math.max(start.valueOf(), service.start.valueOf());
      if (overlap >= MIN_HOURS_FOR_DAY * 60 * 60 * 1000) days.add(day.format(DATE_FORMAT));
      day = day.add(1, 'day');
    }
  });
  return [...days].sort();
};

const toRanges = (days: string[]): [string, string][] => {
  const ranges: [string, string][] = [];
  days.forEach((day) => {
    const last = ranges[ranges.length - 1];
    if (last && dayjs(last[1]).add(1, 'day').format(DATE_FORMAT) === day) {
      last[1] = day;
    } else {
      ranges.push([day, day]);
    }
  });
  return ranges;
};

// An alert with no stops covers the whole line. One whose stops are all on other lines doesn't.
const coversWholeLine = (shutdown: Shutdown, stations: Station[], lineId: string) =>
  shutdown.stops.length === 0 ||
  stations.length === new Set(stationsForLine(lineId).map((station) => station.station)).size;

export const describeShutdowns = (shutdowns: Shutdown[], lineId: string): ShutdownView[] =>
  shutdowns.map((shutdown) => {
    const stations = shutdownStations(shutdown, lineId);
    return {
      shutdown,
      stations,
      label: shutdownLabel(shutdown.effect, stations),
      bandLabel: coversWholeLine(shutdown, stations, lineId) ? 'Shutdown' : 'Partial shutdown',
      dayRanges: toRanges(shutdownDays(shutdown)),
    };
  });

/** Whether a shutdown empties line-wide metrics. A station closure leaves trains running past it. */
export const isLineWide = (view: ShutdownView) => view.shutdown.effect !== 'STATION_CLOSURE';

/** Whether a shutdown stopped trains between two stations. */
export const affectsTrip = (view: ShutdownView, from: Station, to: Station): boolean => {
  const { effect } = view.shutdown;
  if (view.stations.length === 0) return effect !== 'STATION_CLOSURE';

  const tripBranches =
    from.branches && to.branches ? from.branches.filter((b) => to.branches?.includes(b)) : null;
  const stations = view.stations.filter(
    (s) => !tripBranches || !s.branches || s.branches.some((b) => tripBranches.includes(b))
  );
  const isEndpoint = (s: Station) => s.station === from.station || s.station === to.station;
  if (effect === 'STATION_CLOSURE' || stations.length === 1) return stations.some(isEndpoint);
  if (stations.length === 0) return false;

  // Trips that only touch the end of the shutdown, like Harvard to Park Street during an
  // Alewife–Harvard shuttle, still ran.
  const low = Math.min(from.order, to.order);
  const high = Math.max(from.order, to.order);
  const segmentLow = stations[0].order;
  const segmentHigh = stations[stations.length - 1].order;
  return Math.min(high, segmentHigh) > Math.max(low, segmentLow);
};

export const shutdownDates = (view: ShutdownView): string => {
  const { first_start, last_end } = view.shutdown;
  return first_start === last_end
    ? prettyDate(first_start)
    : `${prettyDate(first_start)} – ${prettyDate(last_end)}`;
};

const isLabelled = ([from, to]: [string, string], range: ShutdownRange) => {
  if (!range.startDate || !range.endDate) return true;
  const span = dayjs(range.endDate).diff(range.startDate, 'day') + 1;
  return (dayjs(to).diff(from, 'day') + 1) / span >= MIN_LABELLED_SHARE;
};

/** A "No data" annotation or block: a stretch of the chart with nothing measured. */
export type Gap = Annotation | Block;

// An x position on the chart; undefined is the chart's own edge.
type Edge = string | undefined;

type Segment = {
  from: Edge;
  to: Edge;
  /** The missing days the segment covers, when both ends are known. */
  days?: [string, string];
  /** The shutdown that explains the segment, if any. */
  view?: ShutdownView;
};

const toDay = (value: unknown) => dayjs(String(value)).format(DATE_FORMAT);
const addDays = (day: string, count: number) => dayjs(day).add(count, 'day').format(DATE_FORMAT);

// Daily points sit at midnight, so the boundary between two days is the noon between their points.
const noonBefore = (day: string) => dayjs(day).subtract(1, 'day').hour(12).format(DATETIME_FORMAT);
const noonAfter = (day: string) => dayjs(day).hour(12).format(DATETIME_FORMAT);

const gapEdges = (gap: Gap): [Edge, Edge] | undefined => {
  if ('from' in gap) return [gap.from, gap.to];
  if (gap.type !== 'box') return undefined;
  const edge = (x: unknown) => (x === undefined ? undefined : String(x));
  return [edge(gap.xMin), edge(gap.xMax)];
};

/**
 * Splits a gap into the stretches shutdowns explain and the stretches still missing for no known
 * reason. A gap runs from the last point before it to the first point after, so its missing days
 * are the ones strictly between; segments at either end keep the gap's own edges so they still
 * meet the line. Undefined for anything that isn't a gap.
 */
const splitGap = (gap: Gap, views: ShutdownView[]): Segment[] | undefined => {
  const edges = gapEdges(gap);
  if (!edges) return undefined;
  const [xMin, xMax] = edges;
  const first = xMin === undefined ? undefined : addDays(toDay(xMin), 1);
  const last = xMax === undefined ? undefined : addDays(toDay(xMax), -1);
  if (first && last && last < first) return [{ from: xMin, to: xMax }];

  const pieces = views
    .flatMap((view) =>
      view.dayRanges.map(([from, to]) => ({
        view,
        start: first && first > from ? first : from,
        end: last && last < to ? last : to,
      }))
    )
    .filter(({ start, end }) => start <= end)
    .sort((a, b) => (a.start < b.start ? -1 : 1));

  const segments: Segment[] = [];
  let cursorDay = first;
  let cursorEdge = xMin;
  pieces.forEach(({ view, start, end }) => {
    if (cursorDay && end < cursorDay) return;
    const from = cursorDay && start < cursorDay ? cursorDay : start;
    if (!cursorDay || from > cursorDay) {
      segments.push({
        from: cursorEdge,
        to: noonBefore(from),
        days: cursorDay ? [cursorDay, addDays(from, -1)] : undefined,
      });
    }
    const to = end === last ? xMax : noonAfter(end);
    segments.push({
      from: from === cursorDay ? cursorEdge : noonBefore(from),
      to,
      days: [from, end],
      view,
    });
    cursorDay = addDays(end, 1);
    cursorEdge = to;
  });
  if (!last || !cursorDay || cursorDay <= last) {
    segments.push({
      from: cursorEdge,
      to: xMax,
      days: cursorDay && last ? [cursorDay, last] : undefined,
    });
  }
  return segments;
};

const tooltipFor = (view: ShutdownView) => ({
  title: view.label,
  lines: [shutdownDates(view), view.shutdown.header],
});

const bandLabelFor = (segment: Segment, view: ShutdownView, range: ShutdownRange) =>
  !segment.days || isLabelled(segment.days, range) ? view.bandLabel : '';

const shutdownBox = (segment: Segment, view: ShutdownView, range: ShutdownRange): Annotation => {
  const label = bandLabelFor(segment, view, range);
  return {
    type: 'box',
    xMin: segment.from,
    xMax: segment.to,
    backgroundColor: CHART_COLORS.SHUTDOWN,
    borderWidth: 0,
    label: {
      content: label,
      rotation: -90,
      color: CHART_COLORS.SHUTDOWN_TEXT,
      textStrokeColor: CHART_COLORS.SHUTDOWN_TEXT_STROKE,
      textStrokeWidth: 3,
      display: label !== '',
    },
    ...annotationTooltip(tooltipFor(view)),
  };
};

// A gap split around a shutdown keeps its "No data" label only where there's room for it.
const leftoverLabelled = (segments: Segment[], segment: Segment, range: ShutdownRange) =>
  segments.length === 1 || !segment.days || isLabelled(segment.days, range);

/** "No data" annotations with the stretches shutdowns explain drawn as labelled shutdown bands. */
export const explainGaps = (
  gaps: Annotation[],
  views: ShutdownView[],
  range: ShutdownRange = {}
): Annotation[] =>
  gaps.flatMap((gap) => {
    const segments = splitGap(gap, views);
    if (!segments) return [gap];
    return segments.map((segment) =>
      segment.view
        ? shutdownBox(segment, segment.view, range)
        : ({
            ...gap,
            xMin: segment.from,
            xMax: segment.to,
            ...(gap.type === 'box' && gap.label && !leftoverLabelled(segments, segment, range)
              ? { label: { ...gap.label, display: false } }
              : {}),
          } as Annotation)
    );
  });

/** The same, for TimeSeriesChart blocks. */
export const explainGapBlocks = (
  gaps: Block[],
  views: ShutdownView[],
  range: ShutdownRange = {}
): Block[] =>
  gaps.flatMap((gap) => {
    const segments = splitGap(gap, views) ?? [{ from: gap.from, to: gap.to }];
    return segments.map((segment): Block => {
      if (!segment.view) {
        return {
          ...gap,
          from: segment.from ?? gap.from,
          to: segment.to ?? gap.to,
          ...(leftoverLabelled(segments, segment, range) ? {} : { label: '' }),
        };
      }
      return {
        from: segment.from ?? gap.from,
        to: segment.to ?? gap.to,
        label: bandLabelFor(segment, segment.view, range),
        fillColor: CHART_COLORS.SHUTDOWN,
        textColor: CHART_COLORS.SHUTDOWN_TEXT,
        textStrokeColor: CHART_COLORS.SHUTDOWN_TEXT_STROKE,
        tooltip: tooltipFor(segment.view),
      };
    });
  });
