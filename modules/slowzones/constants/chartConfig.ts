import type { CartesianScaleTypeRegistry, ScaleOptionsByType } from 'chart.js';

export const stationAxisConfig: Partial<ScaleOptionsByType<keyof CartesianScaleTypeRegistry>> = {
  position: 'top',
  beginAtZero: true,
};
