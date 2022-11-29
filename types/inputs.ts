export interface SelectOption<T = any> {
  label: string;
  value: T;
  id: string;
}

// TODO: change this to a date object? if that's what input returns.
export interface DateOption {
  range: boolean;
  startDate?: string;
  endDate?: string;
}
