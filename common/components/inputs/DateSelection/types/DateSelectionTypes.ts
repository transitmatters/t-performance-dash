import type { DatePresetKey } from '../../../../constants/dates';

export interface DateSelectionInput {
  range: boolean;
  selection: number | undefined;
}

export interface DateSelectionDefaultOptions {
  key: DatePresetKey;
  name: string;
  input: DateParams | SingleDateParams;
}

export interface DateParams {
  startDate?: string;
  endDate?: string;
}

export interface SingleDateParams {
  date?: string;
}
