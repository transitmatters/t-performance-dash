import type { GtfsColorLineId, Line, LineShort } from '../types/lines';
import { RAIL_LINES } from '../types/lines';

export const getGtfsRailLineId = (name: Line | LineShort): GtfsColorLineId => {
  const normalizedColorPart = (
    name.includes('line-') ? name.replace('line-', '') : name
  ).toLowerCase();
  if (!RAIL_LINES.includes(normalizedColorPart)) {
    throw new Error('Not a valid rail line ID');
  }
  const capped = normalizedColorPart.slice(0, 1).toUpperCase() + normalizedColorPart.slice(1);
  return `line-${capped}`;
};
