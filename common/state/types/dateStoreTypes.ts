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

export interface DateStoreConfiguration {
  lineConfig: LineSectionParams;
  singleTripConfig: SingleTripsSectionParams;
  multiTripConfig: MultiTripsSectionParams;
  systemConfig: SystemSectionParams;
}
