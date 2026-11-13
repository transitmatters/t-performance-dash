import type { CSSProperties } from 'react';
import dayjs from 'dayjs';
import { LINE_TEXT_COLORS } from '../../../common/constants/colors';
import type {
  RreAmenity,
  RreDayKind,
  RreJourney,
  RreJourneysResponse,
  RreScenarioError,
  RreTravelSegment,
} from '../../../common/types/regionalRailExplorer';
import { formatMinutes } from '../../service/regionalRail/utils';

const HOUR = 3600;

export const DAY_OPTIONS: [RreDayKind, string][] = [
  ['weekday', 'Weekday'],
  ['saturday', 'Saturday'],
  ['sunday', 'Sunday'],
];

/** Departure times to choose from, keyed by seconds after midnight. */
export const TIME_OPTIONS: [string, string][] = [
  [`${8 * HOUR}`, '8 AM'],
  [`${12 * HOUR}`, 'Noon'],
  [`${17 * HOUR}`, '5 PM'],
  [`${21 * HOUR}`, '9 PM'],
];

// Midday is when today's schedule thins out most, and what the Service page's midday wait measures
export const DEFAULT_TIME = 12 * HOUR;

/**
 * Regional Rail takes Commuter Rail's purple, raised in dark mode to stay readable on a dark card.
 * Set on the preview, as `--rr` and `--rr-dark`.
 */
export const RR_COLORS = {
  '--rr': LINE_TEXT_COLORS['line-commuter-rail'].light,
  '--rr-dark': LINE_TEXT_COLORS['line-commuter-rail'].dark,
} as CSSProperties;

/** Dot colors for each schedule, shared by the table's key and the strip of trains. */
export const DOT_CLASS = {
  today: 'bg-muted-foreground',
  regionalRail: 'bg-(--rr) dark:bg-(--rr-dark)',
};

/** "leaving at noon on a weekday", "leaving at 9 PM on a Saturday". */
export const describeDeparture = (day: RreDayKind, time: number) => {
  const timeLabel = TIME_OPTIONS.find(([key]) => key === `${time}`)?.[1] ?? formatClock(time);
  const dayLabel = DAY_OPTIONS.find(([key]) => key === day)?.[1] ?? day;
  return `leaving at ${timeLabel === 'Noon' ? 'noon' : timeLabel} on a ${day === 'weekday' ? 'weekday' : dayLabel}`;
};

/** The kind of day a single-day page's date falls on. A date range plans a weekday. */
export const dayKindForDate = (date?: string): RreDayKind => {
  if (!date) return 'weekday';
  const dayOfWeek = dayjs(date).day();
  return dayOfWeek === 6 ? 'saturday' : dayOfWeek === 0 ? 'sunday' : 'weekday';
};

// Matches the Explorer's isRegionalRailRouteId
const isRegionalRailRoute = (routeId: string) =>
  routeId.startsWith('CR-') || routeId.startsWith('RR-');

const isJourney = (entry?: RreJourney | RreScenarioError): entry is RreJourney =>
  !!entry && !('error' in entry) && !entry.navigationFailed && entry.segments.length > 0;

export interface TripSummary {
  /** When the rider leaves, and when they arrive. */
  start: number;
  end: number;
  /** Time spent waiting for Commuter Rail or Regional Rail trains. */
  wait: number;
  /** When trains leave the boarding station toward this trip. Unset if the trip starts on the subway. */
  trains?: number[];
  /** When the train this trip catches leaves. */
  caught?: number;
}

/** One scenario's trip, measured the way the Explorer measures it. Null when it has no trip. */
export const summarizeTrip = (entry?: RreJourney | RreScenarioError): TripSummary | null => {
  if (!isJourney(entry)) return null;
  const { segments, arrivals } = entry;
  // The Explorer only counts waits for Commuter Rail and Regional Rail trains
  const wait = segments.reduce((total, segment, index) => {
    const previous = segments[index - 1];
    return segment.kind === 'travel' &&
      previous?.kind === 'transfer' &&
      isRegionalRailRoute(segment.routeId)
      ? total + previous.waitDuration
      : total;
  }, 0);
  const firstTravel = segments.find(
    (segment): segment is RreTravelSegment => segment.kind === 'travel'
  );
  const boardsTrain = firstTravel && isRegionalRailRoute(firstTravel.routeId);
  return {
    start: segments[0].startTime,
    end: segments[segments.length - 1].endTime,
    wait,
    trains: boardsTrain ? arrivals[firstTravel.startStation.id]?.times : undefined,
    caught: boardsTrain ? firstTravel.startTime : undefined,
  };
};

const AMENITY_ORDER: RreAmenity[] = ['electricTrains', 'increasedTopSpeed', 'levelBoarding'];

export interface TripComparison {
  today: TripSummary | null;
  regionalRail: TripSummary | null;
  /** What Regional Rail adds to this trip that today's trains lack. */
  amenities: RreAmenity[];
}

/** The Explorer sends today's Commuter Rail first, then Regional Rail. */
export const compareTrips = ([today, regionalRail]: RreJourneysResponse): TripComparison => {
  const hadAlready = isJourney(today) ? today.amenities : [];
  const added = isJourney(regionalRail)
    ? regionalRail.amenities.filter((amenity) => !hadAlready.includes(amenity))
    : [];
  return {
    today: summarizeTrip(today),
    regionalRail: summarizeTrip(regionalRail),
    amenities: AMENITY_ORDER.filter((amenity) => added.includes(amenity)),
  };
};

/** How much less Regional Rail takes, as a whole percent. Undefined unless it's less. */
export const percentLess = (today: number, regionalRail: number) => {
  if (today <= 0) return undefined;
  const percent = Math.round(100 * (1 - regionalRail / today));
  return percent > 0 ? percent : undefined;
};

/** "3×" or "2.5×", when Regional Rail runs at least half again as many trains. */
export const trainsMultiple = (today: number, regionalRail: number) => {
  if (today <= 0) return undefined;
  const ratio = regionalRail / today;
  if (ratio < 1.5) return undefined;
  return `${ratio >= 10 ? Math.round(ratio) : Math.round(ratio * 10) / 10}×`;
};

/** A duration in seconds, floored to the minute as the Explorer does: "49 min", "1 hr 12 min". */
export const formatDuration = (seconds: number) => formatMinutes(Math.floor(seconds / 60));

/** A time of day in seconds after midnight: "9:05 PM". Trains after midnight wrap around. */
export const formatClock = (seconds: number) => {
  const minutes = Math.floor(seconds / 60) % (24 * 60);
  const hours = Math.floor(minutes / 60);
  const suffix = hours < 12 ? 'AM' : 'PM';
  return `${hours % 12 || 12}:${`${minutes % 60}`.padStart(2, '0')} ${suffix}`;
};
