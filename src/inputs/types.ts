export interface Option {
  value: string;
  label: string;
  disabled?: boolean;
  titleSuffix?: string;
}

export interface Options {
  [index: string]: Option;
}
