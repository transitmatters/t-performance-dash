export interface SelectOption<T = any> {
  label: string;
  value: T;
  id: string;
}

// TODO: change this to a date object? if that's what input returns.
export interface DateOption {
  startDate?: string;
  endDate?: string;
  range?: boolean;
}