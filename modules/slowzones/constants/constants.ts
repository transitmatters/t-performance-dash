import type { Direction } from '../../../common/types/dataPoints';

export const DirectionObject: { [key in Direction]: string } = {
  northbound: 'Northbound',
  southbound: 'Southbound',
};
