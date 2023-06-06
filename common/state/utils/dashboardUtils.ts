import dayjs from 'dayjs';
import type { OverviewDatePresetKey } from '../../constants/dates';
import { SMALL_DATE_FORMAT, RANGE_PRESETS } from '../../constants/dates';
import type { Section } from '../../constants/pages';
import type { QueryParams } from '../../types/router';
import { getParams } from '../../utils/router';
import type { DashboardConfig } from '../dashboardConfig';

export const saveDashboardConfig = (
  section: Section,
  query: QueryParams,
  dashboardConfig: DashboardConfig
) => {
  if (section === 'trips') {
    // TODO: filter out invalid keys.
    const params = getParams(query);
    if (params.startDate) dashboardConfig.setTripConfig(params);
  }
  if (section === 'line') {
    dashboardConfig.setLineConfig({ startDate: query.startDate, endDate: query.endDate });
  }
};

export const getDashboardConfig = (section: Section, dashboardConfig: DashboardConfig) => {
  if (section === 'trips') return dashboardConfig.tripConfig;
  if (section === 'system') return dashboardConfig.systemConfig;
  if (section === 'line') return dashboardConfig.lineConfig;
  if (section === 'overview') return dashboardConfig.overviewPreset;
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
