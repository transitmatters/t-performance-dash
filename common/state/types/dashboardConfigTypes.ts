import type { OverviewDatePresetKey } from '../../constants/dates';
import type { QueryTypeOptions } from '../../types/router';

export type LineSectionParams = Partial<{
  startDate: string;
  endDate: string;
}>;

export type TripsSectionParams = Partial<{
  startDate: string;
  endDate: string;
  queryType: QueryTypeOptions;
  from: string;
  to: string;
}>;

export type OverviewPresetParams = {
  view: OverviewDatePresetKey;
};

export interface FullDashboardConfig {
  lineConfig: LineSectionParams;
  tripConfig: TripsSectionParams;
  overviewPreset?: OverviewPresetParams;
}
