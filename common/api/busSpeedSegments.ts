import dayjs from 'dayjs';
import { BUS_SPEED_SEGMENTS_BASE_PATH } from '../../modules/busspeedmap/constants';
import type { FetchBusSpeedSegmentsOptions } from '../../modules/busspeedmap/types';

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
 * Month and day are not zero-padded, matching the Events-lamp/ and Events/ key layouts the
 * rest of the performance bucket already uses.
 */
export const busSpeedSegmentsPath = (date: string): string => {
  const day = dayjs(date);
  return `${BUS_SPEED_SEGMENTS_BASE_PATH}/Year=${day.year()}/Month=${day.month() + 1}/Day=${day.date()}/segments.pmtiles`;
};

/**
 * PMTiles are read byte-range by byte-range straight from the browser as the map pans and
 * zooms, so there is no whole-file fetch or parse to do up front. This just confirms the
 * file exists for the date, so a service date outside coverage still surfaces as "no data"
 * instead of the pmtiles reader failing on a 404 deep inside maplibre.
 */
export const fetchBusSpeedSegmentsUrl = async ({
  date,
}: FetchBusSpeedSegmentsOptions): Promise<string> => {
  if (!date) throw new Error('A service date is required to load bus speed segments.');

  const url = new URL(busSpeedSegmentsPath(date), window.location.origin);
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
