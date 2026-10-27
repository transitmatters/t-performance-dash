import dayjs from 'dayjs';
import type { AggregateChunkProgress } from '../types/charts';
import { prettyDate } from './date';

export interface DateChunk {
  startDate: string;
  endDate: string;
}

// Long aggregate requests read every raw event in the range and time out at API Gateway's 29s,
// so ranges longer than this are fetched as separate requests.
export const DEFAULT_CHUNK_MONTHS = 12;

const DATE_FORMAT = 'YYYY-MM-DD';

/**
 * Splits a date range into chunks aligned to calendar boundaries (Jan 1 for 12-month chunks,
 * Jan 1 / Jul 1 for 6-month chunks), newest first. Aligned chunks keep the same URL whichever
 * range they came from, so fully past chunks are reused from the browser cache. Ranges no longer
 * than `chunkMonths` come back as a single chunk, unchanged.
 */
export const splitDateRange = (
  startDate: string,
  endDate: string,
  chunkMonths: number = DEFAULT_CHUNK_MONTHS
): DateChunk[] => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  if (!end.isAfter(start.add(chunkMonths, 'month'))) return [{ startDate, endDate }];

  const chunks: DateChunk[] = [];
  const yearStart = start.startOf('year');
  const offset = Math.floor(start.diff(yearStart, 'month') / chunkMonths) * chunkMonths;
  let chunkStart = yearStart.add(offset, 'month');
  while (!chunkStart.isAfter(end)) {
    const nextStart = chunkStart.add(chunkMonths, 'month');
    const chunkEnd = nextStart.subtract(1, 'day');
    chunks.push({
      startDate: (chunkStart.isBefore(start) ? start : chunkStart).format(DATE_FORMAT),
      endDate: (chunkEnd.isAfter(end) ? end : chunkEnd).format(DATE_FORMAT),
    });
    chunkStart = nextStart;
  }
  return chunks.reverse();
};

/** Subtitle for charts drawn from the newest chunk only, naming the window they cover. */
export const newestChunkSubtitle = (chunks?: AggregateChunkProgress) =>
  chunks
    ? `Most recent: ${prettyDate(chunks.byTimeRange.startDate)} – ${prettyDate(chunks.byTimeRange.endDate)}`
    : undefined;
