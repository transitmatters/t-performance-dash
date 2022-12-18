export interface SelectOption<T = any> {
  label: string;
  value: T;
  id: string;
}

export interface DateOption {
  range: boolean;
  startDate?: string;
  endDate?: string;
}
