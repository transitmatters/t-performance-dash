export type DataPage =
  | 'overview'
  | 'traveltimes'
  | 'slowzones'
  | 'headways'
  | 'dwells'
  | 'ridership'
  | 'service'
  | 'more';

export type DataPageNames = Record<DataPage, string>;
