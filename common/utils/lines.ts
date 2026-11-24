import type { GtfsColorLineId, Line, LineShort } from '../types/lines';
import { GTFS_COLOR_LINE_IDS } from '../types/lines';
import { isOneOf } from './objects';

export const getGtfsRailLineId = (name: Line | LineShort): GtfsColorLineId => {
  const normalizedColorPart = (
    name.includes('line-') ? name.replace('line-', '') : name
  ).toLowerCase();
  const capped = normalizedColorPart.slice(0, 1).toUpperCase() + normalizedColorPart.slice(1);
  const id = `line-${capped}`;
  if (!isOneOf(GTFS_COLOR_LINE_IDS, id)) {
    throw new Error('Not a valid rail line ID');
  }
  return id;
};
