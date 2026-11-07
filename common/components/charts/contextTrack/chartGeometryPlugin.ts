import type { Dispatch, SetStateAction } from 'react';
import type { Plugin } from 'chart.js';
import type { Domain } from './segments';

/** Where the plot sits in the canvas, in CSS pixels, and the x scale's range. */
export interface TrackGeometry extends Domain {
  left: number;
  right: number;
}

const sameGeometry = (a: TrackGeometry, b: TrackGeometry) =>
  a.left === b.left && a.right === b.right && a.min === b.min && a.max === b.max;

/**
 * Reports the plot's position and x range after every layout, so the context track below the
 * canvas can line its segments up with the x axis. Unchanged values keep the previous state, which
 * stops a redrawing chart from re-rendering itself in a loop.
 */
export const chartGeometryPlugin = (
  setGeometry: Dispatch<SetStateAction<TrackGeometry | null>>
): Plugin => ({
  id: 'trackGeometry',
  afterUpdate: (chart) => {
    const { x } = chart.scales;
    if (!x || !chart.chartArea) return;
    const next = {
      left: Math.round(chart.chartArea.left),
      right: Math.round(chart.chartArea.right),
      min: x.min,
      max: x.max,
    };
    setGeometry((previous) => (previous && sameGeometry(previous, next) ? previous : next));
  },
});
