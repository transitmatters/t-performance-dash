export type DisplayStyle = {
  color: string;
  opacity?: number;
  borderWidth: number;
};

type ByHourData = number[];

export type ByHourDataset = {
  label: string;
  data: ByHourData;
  style?: Partial<DisplayStyle>;
};

export type ValueAxis = {
  title: string;
  tooltipItemLabel?: string;
};
