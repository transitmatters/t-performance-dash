import type { SetStateAction } from 'react';
import type { Chart } from 'chart.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { chartGeometryPlugin } from './chartGeometryPlugin';
import type { TrackGeometry } from './chartGeometryPlugin';

const chartAt = (left: number, right: number) =>
  ({ chartArea: { left, right }, scales: { x: { min: 0, max: 100 } } }) as unknown as Chart;

const layout = (plugin: ReturnType<typeof chartGeometryPlugin>, chart: Chart) =>
  (plugin.afterUpdate as (chart: Chart) => void)(chart);

describe('chartGeometryPlugin', () => {
  let frames: FrameRequestCallback[];
  let state: TrackGeometry | null;
  const setGeometry = vi.fn((update: SetStateAction<TrackGeometry | null>) => {
    state = typeof update === 'function' ? update(state) : update;
  });
  const flushFrame = () => frames.splice(0).forEach((callback) => callback(0));

  beforeEach(() => {
    frames = [];
    state = null;
    setGeometry.mockClear();
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reports only the last layout in a frame', () => {
    const plugin = chartGeometryPlugin(setGeometry);
    layout(plugin, chartAt(40, 300));
    layout(plugin, chartAt(40, 1000));
    flushFrame();
    expect(setGeometry).toHaveBeenCalledTimes(1);
    expect(state).toEqual({ left: 40, right: 1000, min: 0, max: 100 });
  });

  it('keeps the previous state when a rebuilt chart settles on the same geometry', () => {
    const plugin = chartGeometryPlugin(setGeometry);
    layout(plugin, chartAt(40, 1000));
    flushFrame();
    const settled = state;

    // A redraw lays out at the canvas's default size, then at its real size
    layout(plugin, chartAt(40, 300));
    layout(plugin, chartAt(40, 1000));
    flushFrame();
    expect(state).toBe(settled);
  });
});
