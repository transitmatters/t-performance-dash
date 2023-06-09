import dayjs from 'dayjs';
import type { OverviewDatePresetKey } from '../../constants/dates';
import { SMALL_DATE_FORMAT, RANGE_PRESETS } from '../../constants/dates';
import type { DateConfigSection } from '../../constants/pages';
import type { QueryParams } from '../../types/router';
import { getDateParams } from '../../utils/router';
import type { DateStore } from '../dateConfig';

export const saveDateConfig = (
  dateConfigSection: DateConfigSection,
  query: QueryParams,
  dateStore: DateStore
) => {
  const params = getDateParams(query);

  if (dateConfigSection === 'trips') {
    if (params.startDate) dateStore.setTripConfig(params);
  }
  if (dateConfigSection === 'line') {
    dateStore.setLineConfig(params);
  }
};

export const getDateConfig = (dateConfigSection: DateConfigSection, dateStore: DateStore) => {
  if (dateConfigSection === 'trips') return dateStore.tripConfig;
  if (dateConfigSection === 'system') return dateStore.systemConfig;
  if (dateConfigSection === 'line') return dateStore.lineConfig;
  if (dateConfigSection === 'overview') return dateStore.overviewPreset;
  return {};
};

export const getSelectedDates = (dateConfig: {
  startDate?: string;
  endDate?: string;
  view?: OverviewDatePresetKey;
}) => {
  const { startDate, endDate, view } = dateConfig;
  const startDateDayjs = startDate ? dayjs(startDate) : undefined;
  const endDateDayjs = endDate ? dayjs(endDate) : undefined;
  const viewInput = view ? RANGE_PRESETS[view]?.input : undefined;
  if (viewInput)
    return `${dayjs(viewInput.startDate).format(SMALL_DATE_FORMAT)} - ${dayjs(
      viewInput.endDate
    ).format(SMALL_DATE_FORMAT)}`;
  if (startDateDayjs && endDateDayjs)
    return `${startDateDayjs.format(SMALL_DATE_FORMAT)} - ${endDateDayjs.format(
      SMALL_DATE_FORMAT
    )}`;
  if (startDateDayjs) return startDateDayjs.format(SMALL_DATE_FORMAT);
  return undefined;
};
