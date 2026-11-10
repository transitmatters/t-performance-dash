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
 * Reports the plot's position and x range after layout, so the context track below the canvas
 * can line its segments up with the x axis.
 *
 * A chart built with `redraw` lays out twice, at the canvas's default size and again once it
 * resizes to fit. Only the last layout in a frame is reported, and unchanged values keep the
 * previous state; otherwise each rebuild sees a "new" geometry and re-renders itself in a loop.
 */
export const chartGeometryPlugin = (
  setGeometry: Dispatch<SetStateAction<TrackGeometry | null>>
): Plugin => {
  let latest: TrackGeometry | null = null;
  let frame: number | null = null;
  return {
    id: 'trackGeometry',
    afterUpdate: (chart) => {
      const { x } = chart.scales;
      if (!x || !chart.chartArea) return;
      latest = {
        left: Math.round(chart.chartArea.left),
        right: Math.round(chart.chartArea.right),
        min: x.min,
        max: x.max,
      };
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        const next = latest;
        if (!next) return;
        setGeometry((previous) => (previous && sameGeometry(previous, next) ? previous : next));
      });
    },
  };
};
