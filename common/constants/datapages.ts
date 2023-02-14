import type { DataPageNames } from '../types/dataPages';

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

export const DATA_PAGES = {
  overview: { href: '/', name: 'Overview' },
  traveltimes: { href: '/traveltimes', name: 'Travel Times' },
  slowzones: { href: '/slowzones', name: 'Slow Zones' },
  headways: { href: '/headways', name: 'Headways' },
  dwells: { href: '/dwells', name: 'Dwells' },
  ridership: { href: '/ridership', name: 'Ridership' },
};
