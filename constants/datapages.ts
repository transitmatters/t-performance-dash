export type DataPage =
  | 'general'
  | 'traveltimes'
  | 'slowzones'
  | 'headways'
  | 'dwells'
  | 'ridership'
  | 'service'
  | 'more';

export type DataPageNames = Record<DataPage, string>;

export const DATA_PAGE_NAMES: DataPageNames = {
  general: 'General',
  traveltimes: 'Travel Times',
  slowzones: 'Slow Zones',
  headways: 'Headways',
  dwells: 'Dwells',
  more: 'More',
  ridership: 'Ridership',
  service: 'Service',
};

export const DATA_PAGES = ['general', 'traveltimes', 'slowzones', 'headways', 'dwells', 'more'];
