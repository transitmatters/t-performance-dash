import type { Direction } from '../../../common/types/dataPoints';
import { objectEntries } from '../../../common/utils/objects';

export const DirectionObject: { [key in Direction]: string } = {
  northbound: 'Northbound',
  southbound: 'Southbound',
};

export const DIRECTION_OPTIONS: [Direction, string][] = objectEntries(DirectionObject);
