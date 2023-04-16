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
  if (section === 'trips') {
    return dashboardConfig.tripConfig;
  }
  if (section === 'line') {
    return dashboardConfig.lineConfig;
  }
  if (section === 'overview') {
    return dashboardConfig.overviewPreset;
  }
};
