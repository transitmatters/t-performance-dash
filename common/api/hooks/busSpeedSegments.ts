import { useQuery } from '@tanstack/react-query';
import type {
  FetchBusSpeedSegmentsOptions,
  FetchBusSpeedSegmentsUrlOptions,
} from '../../../modules/busspeedmap/types';
import { ONE_DAY } from '../../constants/time';
import {
  busDwellsFile,
  busSpeedSegmentsFile,
  fetchBusDwellsUrl,
  fetchBusSpeedSegmentLeaderboard,
  fetchBusSpeedSegmentsHasFreeFlow,
  fetchBusSpeedSegmentsUrl,
  fetchBusSpeedStops,
} from '../busSpeedSegments';

/**
 * Switching between the band archive and all_day's keeps the other file's URL while this one is
 * checked, so the map stays mounted where the user left it and swaps its Source URL in place. A
 * new date or period still shows the loading placeholder, as it always has.
 */
const sameDateAndPeriod = <T>(
  options: FetchBusSpeedSegmentsUrlOptions,
  previous: T | undefined,
  previousKey: { date?: string; period?: string } | undefined
): T | undefined =>
  previousKey?.date === options.date && previousKey?.period === options.period
    ? previous
    : undefined;

export const useBusSpeedSegmentsUrl = (
  options: FetchBusSpeedSegmentsUrlOptions,
  enabled?: boolean
) => {
  const { date, period, timeBand } = options;
  return useQuery({
    // Keyed on the band's file rather than the band itself: the six bands share one archive,
    // so switching between them reuses this URL instead of re-checking it.
    queryKey: [
      'busSpeedSegmentsUrl',
      { date, period, file: busSpeedSegmentsFile(timeBand) },
    ] as const,
    queryFn: () => fetchBusSpeedSegmentsUrl(options),
    enabled: enabled,
    placeholderData: (previous, previousQuery) =>
      sameDateAndPeriod(options, previous, previousQuery?.queryKey[1]),
    // A published service date never changes, so a day of both freshness and retention
    // makes flipping back to an already-viewed date instant instead of a re-check.
    staleTime: ONE_DAY,
    gcTime: ONE_DAY,
  });
};

/** The dwell archive beside the segments, or null for a date published before it existed. */
export const useBusDwellsUrl = (options: FetchBusSpeedSegmentsUrlOptions, enabled?: boolean) => {
  const { date, period, timeBand } = options;
  return useQuery({
    queryKey: ['busDwellsUrl', { date, period, file: busDwellsFile(timeBand) }] as const,
    queryFn: () => fetchBusDwellsUrl(options),
    enabled: enabled,
    placeholderData: (previous, previousQuery) =>
      sameDateAndPeriod(options, previous, previousQuery?.queryKey[1]),
    staleTime: ONE_DAY,
    gcTime: ONE_DAY,
  });
};

/**
 * Whether the segments archive at `pmtilesUrl` has free-flow times to colour by delay. Holds the
 * last answer while a new archive is checked, so switching band or date doesn't flash the control
 * away and back. Undefined while unknown, and if the metadata can't be read.
 */
export const useBusSpeedSegmentsHasFreeFlow = (pmtilesUrl: string | undefined) => {
  return useQuery({
    queryKey: ['busSpeedSegmentsHasFreeFlow', pmtilesUrl] as const,
    queryFn: () => (pmtilesUrl ? fetchBusSpeedSegmentsHasFreeFlow(pmtilesUrl) : false),
    enabled: Boolean(pmtilesUrl),
    placeholderData: (previous) => previous,
    staleTime: ONE_DAY,
    gcTime: ONE_DAY,
  });
};

export const useBusSpeedSegmentLeaderboard = (
  options: FetchBusSpeedSegmentsOptions,
  enabled?: boolean
) => {
  return useQuery({
    queryKey: ['busSpeedSegmentLeaderboard', options],
    queryFn: () => fetchBusSpeedSegmentLeaderboard(options),
    enabled: enabled,
    staleTime: ONE_DAY,
    gcTime: ONE_DAY,
  });
};

export const useBusSpeedStops = () => {
  return useQuery({
    queryKey: ['busSpeedStops'],
    queryFn: fetchBusSpeedStops,
    // Only changes with MBTA's GTFS feed, so one fetch lasts the whole session.
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
