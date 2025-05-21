const SLOW_ZONES_LINES = ['Red', 'Blue', 'Orange', 'Green', 'Mattapan'] as const;

export type SlowZonesLineName = (typeof SLOW_ZONES_LINES)[number];
