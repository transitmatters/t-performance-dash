export interface DateSelectionInput {
  range: boolean;
  selection: number | undefined;
}

export interface DateSelectionDefaultOptions {
  name: string;
  input: { startDate: string; endDate?: string };
}

export interface DateParams {
  startDate: string;
  endDate?: string;
}
