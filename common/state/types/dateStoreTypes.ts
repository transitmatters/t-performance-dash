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
}>;

export type SystemSectionParams = Partial<{
  startDate: string;
  endDate: string;
}>;

export type OverviewPresetParams = {
  view: OverviewDatePresetKey;
};

export interface DateStoreConfiguration {
  lineConfig: LineSectionParams;
  tripConfig: TripsSectionParams;
  systemConfig: SystemSectionParams;
  overviewPreset?: OverviewPresetParams;
}
