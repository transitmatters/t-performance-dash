export interface DateSelectionInput {
  range: boolean;
  selection: number | undefined;
}

export interface DateSelectionDefaultOptions {
  key: string;
  name: string;
  input: DateParams;
}

export interface DateParams {
  startDate?: string;
  endDate?: string;
}
