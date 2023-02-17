export type Line = 'RL' | 'OL' | 'GL' | 'BL' | 'BUS';
export type LineShort = 'Red' | 'Orange' | 'Green' | 'Blue' | 'Bus';
export type LinePath = 'red' | 'orange' | 'green' | 'blue' | 'bus';
export type LineMetadata = {
  name: string;
  color: string;
  short: LineShort;
  path: LinePath;
  key: Line;
};
export type LineObject = { [key in Line]: LineMetadata };
export const ALL_LINE_PATHS = ['red', 'orange', 'green', 'blue'].map((line) => {
  return {
    params: {
      line: line,
    },
  };
});

export const BUS_PATH = {
  params: {
    line: 'bus',
  },
};
