import { isOneOf } from '../../common/utils/objects';

export const SLOW_ZONES_LINES = ['Red', 'Blue', 'Orange', 'Green', 'Mattapan'] as const;

export type SlowZonesLineName = (typeof SLOW_ZONES_LINES)[number];

export const isSlowZonesLine = (lineShort: string): lineShort is SlowZonesLineName =>
  isOneOf(SLOW_ZONES_LINES, lineShort);
