export interface DateSelectionInput {
  range: boolean;
  selection: number | undefined;
}

export interface DateSelectionDefaultOptions {
  name: string;
  input: DateParams;
}

export interface DateParams {
  startDate?: string;
  endDate?: string;
}
