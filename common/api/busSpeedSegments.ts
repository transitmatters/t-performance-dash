import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { BUS_SPEED_SEGMENTS_BASE_PATH } from '../../modules/busspeedmap/constants';
import type {
  BusSpeedSegmentLeaderboardResponse,
  FetchBusSpeedSegmentsOptions,
  Period,
} from '../../modules/busspeedmap/types';

dayjs.extend(isoWeek);

/**
 * Thrown when a service date simply has no file — before coverage starts, during the
 * 2025-11-01..2025-12-23 gap, or before the day's ingest has run. Distinguished from a
 * genuine failure so the page can show "no data" rather than an error.
 */
export class BusSpeedDataUnavailableError extends Error {
  constructor(date: string) {
    super(`No bus speed segments published for ${date}.`);
    this.name = 'BusSpeedDataUnavailableError';
  }
}

/**
 * Year/month/day/week numbers are not zero-padded, matching the Events-lamp/ and Events/ key
 * layouts the rest of the performance bucket already uses.
 *
 * Weekly files are keyed by ISO week (Monday-start, and the year that ISO week belongs to --
 * not necessarily `date`'s calendar year for the last/first few days of December). Workday
 * vs. weekend vs. holiday is not part of the path: it's a property/key within each period's
 * single file (a pmtiles source-layer, or a leaderboard.json top-level key), selected
 * client-side rather than fetched separately.
 */
const periodDirectory = (date: string, period: Period): string => {
  const day = dayjs(date);
  switch (period) {
    case 'daily':
      return `daily/Year=${day.year()}/Month=${day.month() + 1}/Day=${day.date()}`;
    case 'weekly':
      return `weekly/Year=${day.isoWeekYear()}/Week=${day.isoWeek()}`;
    case 'monthly':
      return `monthly/Year=${day.year()}/Month=${day.month() + 1}`;
  }
};

export const busSpeedSegmentsPath = (date: string, period: Period): string =>
  `${BUS_SPEED_SEGMENTS_BASE_PATH}/${periodDirectory(date, period)}/segments.pmtiles`;

export const busSpeedSegmentLeaderboardPath = (date: string, period: Period): string =>
  `${BUS_SPEED_SEGMENTS_BASE_PATH}/${periodDirectory(date, period)}/leaderboard.json`;

/**
 * PMTiles are read byte-range by byte-range straight from the browser as the map pans and
 * zooms, so there is no whole-file fetch or parse to do up front. This just confirms the
 * file exists for the date, so a service date outside coverage still surfaces as "no data"
 * instead of the pmtiles reader failing on a 404 deep inside maplibre.
 */
export const fetchBusSpeedSegmentsUrl = async ({
  date,
  period,
}: FetchBusSpeedSegmentsOptions): Promise<string> => {
  if (!date) throw new Error('A service date is required to load bus speed segments.');

  const url = new URL(busSpeedSegmentsPath(date, period), window.location.origin);
  const response = await fetch(url.toString(), { method: 'HEAD' });

  // A missing object is served as the site's own HTML 404 page, so the status has to be
  // checked before this URL goes anywhere near the pmtiles reader.
  if (response.status === 403 || response.status === 404) {
    throw new BusSpeedDataUnavailableError(date);
  }
  if (!response.ok) {
    throw new Error(`Failed to load bus speed segments for ${date}.`);
  }

  return url.toString();
};

/**
 * Unlike the pmtiles archive, the leaderboard file is small (~90-120KB) and meant to be
 * fetched and parsed whole -- a plain GET + response.json(), not a byte-range read. It's
 * served as ordinary application/json, not gzip/zlib-wrapped.
 */
export const fetchBusSpeedSegmentLeaderboard = async ({
  date,
  period,
}: FetchBusSpeedSegmentsOptions): Promise<BusSpeedSegmentLeaderboardResponse> => {
  if (!date)
    throw new Error('A service date is required to load the bus speed segment leaderboard.');

  const url = new URL(busSpeedSegmentLeaderboardPath(date, period), window.location.origin);
  const response = await fetch(url.toString());

  if (response.status === 403 || response.status === 404) {
    throw new BusSpeedDataUnavailableError(date);
  }
  if (!response.ok) {
    throw new Error(`Failed to load the bus speed segment leaderboard for ${date}.`);
  }

  return response.json();
};
