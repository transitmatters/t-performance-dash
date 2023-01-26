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

export const DATA_PAGE_NAMES: DataPageNames = {
  overview: 'Overview',
  traveltimes: 'Travel Times',
  slowzones: 'Slow Zones',
  headways: 'Headways',
  dwells: 'Dwells',
  more: 'More',
  ridership: 'Ridership',
  service: 'Service',
};

export const DATA_PAGES = ['overview', 'traveltimes', 'slowzones', 'headways', 'dwells', 'more'];
