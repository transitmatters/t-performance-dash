import type { OverviewDatePresetKey } from '../../constants/dates';
import type { QueryTypeOptions } from '../../types/router';

export type LineSectionParams = {
  startDate?: string;
  endDate?: string;
};

// TODO: Review optionality of props. Maybe use Partial?
export type TripsSectionParams = {
  startDate?: string;
  endDate?: string;
  queryType?: QueryTypeOptions;
  from?: string;
  to?: string;
};

export type OverviewPresetParams = {
  view: OverviewDatePresetKey;
};

export interface FullDashboardConfig {
  lineConfig: LineSectionParams;
  tripConfig: TripsSectionParams;
  overviewPreset?: OverviewPresetParams;
}
