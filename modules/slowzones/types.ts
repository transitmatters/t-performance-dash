const SLOW_ZONES_LINES = ['Red', 'Blue', 'Green', 'Orange'] as const;

export type SlowZonesLineName = (typeof SLOW_ZONES_LINES)[number];

export const isSlowZonesLine = (name: unknown): name is SlowZonesLineName =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SLOW_ZONES_LINES.includes(name as any);
