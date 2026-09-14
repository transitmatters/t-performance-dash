import dayjs from 'dayjs';
import type { OverviewDatePresetKey } from '../../constants/dates';
import { TODAY_STRING, SMALL_DATE_FORMAT, RANGE_PRESETS } from '../../constants/dates';
import type { DateStoreSection } from '../../constants/pages';
import type { QueryParams } from '../../types/router';
import { getDateParams } from '../../utils/router';
import type { DateStore } from '../dateStore';

export const saveDateStoreSection = (
  dateStoreSection: DateStoreSection,
  query: QueryParams,
  dateStore: DateStore
) => {
  const params = getDateParams(query);

  if (dateStoreSection === 'singleTrips') {
    if (params.date) dateStore.setSingleTripConfig(params);
  }
  if (dateStoreSection === 'multiTrips') {
    if (params.startDate) dateStore.setMultiTripConfig(params);
  }
  if (dateStoreSection === 'line') {
    dateStore.setLineConfig(params);
  }
};

export const TRIP_SECTIONS: DateStoreSection[] = ['singleTrips', 'multiTrips'];

/** How much context to open around a single day when moving to the range view. */
const TRIP_HOP_WINDOW_DAYS = 30;

/**
 * Dates for the hop between the single-day and date-range trip views. Because the two pages keep
 * separate date-store sections, this hop used to discard the date entirely and read a store that is
 * empty on a cold session, so "was March 3 unusually bad?" — the question that requires exactly this
 * hop — threw away March 3 on the way. Carrying the date across keeps the anchor: a single day opens
 * as the month ending on it, and a range collapses back to its last day.
 *
 * Returns undefined when there is nothing to carry, letting the caller fall back to the store.
 */
export const getTripHopDates = (
  fromSection: DateStoreSection,
  toSection: DateStoreSection,
  query: QueryParams
): QueryParams | undefined => {
  if (fromSection === 'singleTrips' && toSection === 'multiTrips') {
    if (!query.date) return undefined;
    return {
      startDate: dayjs(query.date).subtract(TRIP_HOP_WINDOW_DAYS, 'day').format('YYYY-MM-DD'),
      endDate: query.date,
    };
  }
  if (fromSection === 'multiTrips' && toSection === 'singleTrips') {
    const anchor = query.endDate ?? query.startDate;
    if (!anchor) return undefined;
    return { date: anchor };
  }
  return undefined;
};

export const getDateStoreSection = (dateStoreSection: DateStoreSection, dateStore: DateStore) => {
  if (dateStoreSection === 'singleTrips') return dateStore.singleTripConfig;
  if (dateStoreSection === 'multiTrips') return dateStore.multiTripConfig;
  if (dateStoreSection === 'system') return dateStore.systemConfig;
  if (dateStoreSection === 'line') return dateStore.lineConfig;
  if (dateStoreSection === 'overview') return dateStore.overviewPreset;
  return {};
};

export const getSelectedDates = (dateConfig: {
  startDate?: string;
  endDate?: string;
  view?: OverviewDatePresetKey;
}) => {
  const { startDate, endDate, view } = dateConfig;
  const viewInput = view ? RANGE_PRESETS[view]?.input : undefined;
  if (viewInput)
    return `${dayjs(viewInput.startDate).format(SMALL_DATE_FORMAT)} - ${dayjs(
      viewInput.endDate
    ).format(SMALL_DATE_FORMAT)}`;
  if (startDate && endDate) {
    return `${formatDate(startDate)} — ${formatDate(endDate)}`;
  }

  if (startDate) return formatDate(startDate);

  return undefined;
};

const formatDate = (date: string) => {
  return dayjs(date).format(SMALL_DATE_FORMAT);
};

export const formatDateTodayCheck = (date: string) => {
  return date === TODAY_STRING ? 'Today' : formatDate(date);
};
