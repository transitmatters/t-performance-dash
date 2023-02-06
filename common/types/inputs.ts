import { DateType } from 'react-tailwindcss-datepicker/dist/types';

export interface SelectOption<T = any> {
  label: string;
  value: T;
  id: string;
}

export interface DateOption {
  range: boolean;
  startDate: DateType;
  endDate: DateType;
}
