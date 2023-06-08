import dayjs from 'dayjs';
import type { OverviewDatePresetKey } from '../../constants/dates';
import { SMALL_DATE_FORMAT, RANGE_PRESETS } from '../../constants/dates';
import type { DateConfigOptions } from '../../constants/pages';
import type { QueryParams } from '../../types/router';
import { getDateParams } from '../../utils/router';
import type { DateConfig } from '../dateConfig';

export const saveDateConfig = (
  section: DateConfigOptions,
  query: QueryParams,
  dateConfig: DateConfig
) => {
  const params = getDateParams(query);

  if (section === 'singleTrips') {
    if (params.date) dateConfig.setSingleTripConfig(params);
  }
  if (section === 'multiTrips') {
    if (params.startDate) dateConfig.setMultiTripConfig(params);
  }
  if (section === 'line') {
    dateConfig.setLineConfig(params);
  }
};

export const getDateConfig = (section: DateConfigOptions, dateConfig: DateConfig) => {
  if (section === 'singleTrips') return dateConfig.singleTripConfig;
  if (section === 'multiTrips') return dateConfig.multiTripConfig;
  if (section === 'system') return dateConfig.systemConfig;
  if (section === 'line') return dateConfig.lineConfig;
  if (section === 'overview') return dateConfig.overviewPreset;
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
