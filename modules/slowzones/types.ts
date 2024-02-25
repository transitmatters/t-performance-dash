const SLOW_ZONES_LINES = ['Red', 'Blue', 'Orange', 'Green'] as const;

export type SlowZonesLineName = (typeof SLOW_ZONES_LINES)[number];
