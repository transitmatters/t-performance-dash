import type { OverviewDatePresetKey } from '../../constants/dates';

export type LineSectionParams = Partial<{
  startDate: string;
  endDate: string;
}>;

export type MultiTripsSectionParams = Partial<{
  startDate: string;
  endDate: string;
}>;

export type SingleTripsSectionParams = Partial<{
  date: string;
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
  singleTripConfig: SingleTripsSectionParams;
  multiTripConfig: MultiTripsSectionParams;
  systemConfig: SystemSectionParams;
  overviewPreset?: OverviewPresetParams;
}
