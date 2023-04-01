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
  overview: { href: '/overview', name: 'Overview', lines: ['RL', 'BL', 'GL', 'OL', 'BUS'] },
  traveltimes: {
    href: '/traveltimes',
    name: 'Travel Times',
    lines: ['RL', 'BL', 'GL', 'OL', 'BUS'],
  },
  slowzones: { href: '/slowzones', name: 'Slow Zones', lines: ['RL', 'BL', 'OL'] },
  headways: { href: '/headways', name: 'Headways', lines: ['RL', 'BL', 'GL', 'OL', 'BUS'] },
  dwells: { href: '/dwells', name: 'Dwells', lines: ['RL', 'BL', 'GL', 'OL'] },
  ridership: { href: '/ridership', name: 'Ridership', lines: ['RL', 'BL', 'GL', 'OL', 'BUS'] },
};
