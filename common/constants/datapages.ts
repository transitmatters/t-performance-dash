import type { DataPageNames } from '../types/dataPages';
import type { Line } from '../types/lines';

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

export const DATA_PAGES: { [key in string]: { href: string; name: string; lines: Line[] } } = {
  overview: {
    href: '/',
    name: 'Overview',
    lines: ['line-red', 'line-blue', 'line-green', 'line-orange', 'line-bus'],
  },
  traveltimes: {
    href: '/traveltimes',
    name: 'Travel Times',
    lines: ['line-red', 'line-blue', 'line-green', 'line-orange', 'line-bus'],
  },
  slowzones: {
    href: '/slowzones',
    name: 'Slow Zones',
    lines: ['line-red', 'line-blue', 'line-orange'],
  },
  headways: {
    href: '/headways',
    name: 'Headways',
    lines: ['line-red', 'line-blue', 'line-green', 'line-orange', 'line-bus'],
  },
  dwells: {
    href: '/dwells',
    name: 'Dwells',
    lines: ['line-red', 'line-blue', 'line-green', 'line-orange'],
  },
  ridership: {
    href: '/ridership',
    name: 'Ridership',
    lines: ['line-red', 'line-blue', 'line-green', 'line-orange', 'line-bus'],
  },
};
