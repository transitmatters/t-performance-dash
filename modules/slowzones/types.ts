const SLOW_ZONES_LINES = ['Red', 'Blue', 'Orange'] as const;

export type SlowZonesLineName = (typeof SLOW_ZONES_LINES)[number];

export const isSlowZonesLine = (name: unknown): name is SlowZonesLineName =>
  SLOW_ZONES_LINES.includes(name as any);
