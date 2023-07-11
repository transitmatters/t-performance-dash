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
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }

  if (startDate) return formatDate(startDate);

  return undefined;
};

export const formatDate = (date: string) => {
  return date === TODAY_STRING ? 'Today' : dayjs(date).format(SMALL_DATE_FORMAT);
};
