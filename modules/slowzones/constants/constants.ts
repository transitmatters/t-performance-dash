import type { Direction } from '../../../common/types/dataPoints';

export const DirectionObject: { [key in Direction]: string } = {
  northbound: 'Northbound',
  southbound: 'Southbound',
};

/** What the line map labels each slow segment with. */
export type SlowZoneMapLabel = 'slow' | 'travel';

export const MAP_LABEL_OPTIONS: [SlowZoneMapLabel, string][] = [
  ['slow', 'Slow time'],
  ['travel', 'Travel time'],
];
