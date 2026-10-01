import { useQuery } from '@tanstack/react-query';
import type {
  FetchBusSpeedSegmentsOptions,
  FetchBusSpeedSegmentsUrlOptions,
} from '../../../modules/busspeedmap/types';
import { ONE_DAY } from '../../constants/time';
import {
  busSpeedSegmentsFile,
  fetchBusSpeedSegmentLeaderboard,
  fetchBusSpeedSegmentsUrl,
  fetchBusSpeedStops,
} from '../busSpeedSegments';

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
    // Switching between the band archive and all_day's keeps the other file's URL while this
    // one is checked, so the map stays mounted where the user left it and swaps its Source URL
    // in place. A new date or period still shows the loading placeholder, as it always has.
    placeholderData: (previous, previousQuery) => {
      const previousKey = previousQuery?.queryKey[1];
      return previousKey?.date === date && previousKey?.period === period ? previous : undefined;
    },
    // A published service date never changes, so a day of both freshness and retention
    // makes flipping back to an already-viewed date instant instead of a re-check.
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
