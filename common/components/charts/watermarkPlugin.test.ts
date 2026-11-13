import type { Chart } from 'chart.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WatermarkOptions } from './watermarkPlugin';

/** Stands in for the browser's Image, which loads only when the test says so. */
class FakeImage {
  static created: FakeImage[] = [];
  src = '';
  complete = false;
  naturalWidth = 0;
  private listeners: (() => void)[] = [];
  constructor() {
    FakeImage.created.push(this);
  }
  addEventListener(_type: 'load', listener: () => void) {
    this.listeners.push(listener);
  }
  load() {
    this.complete = true;
    this.naturalWidth = 320;
    this.listeners.forEach((listener) => listener());
  }
}

const fakeChart = () => {
  const ctx = { save: vi.fn(), restore: vi.fn(), drawImage: vi.fn(), globalAlpha: 1 };
  const chart = {
    ctx,
    width: 800,
    height: 300,
    chartArea: { left: 40, right: 780, top: 20, bottom: 270 },
    draw: vi.fn(),
  };
  return chart as typeof chart & Chart;
};

let dark = false;
let wide = true;

const loadPlugin = async () => {
  vi.resetModules();
  return import('./watermarkPlugin');
};

type Hooks = {
  beforeDraw: (chart: Chart, args: object, options: WatermarkOptions) => void;
  afterDestroy: (chart: Chart) => void;
};

describe('watermarkPlugin', () => {
  beforeEach(() => {
    dark = false;
    wide = true;
    FakeImage.created = [];
    vi.stubGlobal('Image', FakeImage);
    vi.stubGlobal('document', {
      documentElement: { classList: { contains: (name: string) => name === 'dark' && dark } },
    });
    vi.stubGlobal('window', { matchMedia: () => ({ matches: wide }) });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sets the wordmark in the top-right corner of the plot', async () => {
    const { watermarkPosition } = await loadPlugin();
    const chart = fakeChart();
    expect(watermarkPosition(chart, 'plot', { width: 160, height: 15 })).toEqual({
      x: 780 - 10 - 160,
      y: 20 + 10,
    });
    expect(watermarkPosition(chart, 'below', { width: 160, height: 15 })).toEqual({
      x: 800 - 160,
      y: 300 - 15,
    });
  });

  it('follows the theme on each draw, without rebuilding the chart', async () => {
    const { watermarkPlugin } = await loadPlugin();
    const { beforeDraw } = watermarkPlugin as unknown as Hooks;
    const chart = fakeChart();

    beforeDraw(chart, {}, { placement: 'plot' });
    FakeImage.created.forEach((image) => image.load());
    beforeDraw(chart, {}, { placement: 'plot' });
    expect(chart.ctx.drawImage.mock.lastCall?.[0]).toMatchObject({ src: '/Logo_wordmark.png' });

    dark = true;
    beforeDraw(chart, {}, { placement: 'plot' });
    FakeImage.created.forEach((image) => image.load());
    beforeDraw(chart, {}, { placement: 'plot' });
    expect(chart.ctx.drawImage.mock.lastCall?.[0]).toMatchObject({
      src: '/Logo_wordmark_white.png',
    });
  });

  it('draws smaller on a phone', async () => {
    const { watermarkPlugin } = await loadPlugin();
    const { beforeDraw } = watermarkPlugin as unknown as Hooks;
    const chart = fakeChart();
    beforeDraw(chart, {}, {});
    FakeImage.created[0].load();

    wide = false;
    beforeDraw(chart, {}, {});
    expect(chart.ctx.drawImage.mock.lastCall?.slice(3)).toEqual([120, 11.25]);
  });

  it('draws a chart again once the wordmark loads, unless it was destroyed', async () => {
    const { watermarkPlugin } = await loadPlugin();
    const { beforeDraw, afterDestroy } = watermarkPlugin as unknown as Hooks;
    const kept = fakeChart();
    const destroyed = fakeChart();

    beforeDraw(kept, {}, {});
    beforeDraw(destroyed, {}, {});
    expect(kept.ctx.drawImage).not.toHaveBeenCalled();
    afterDestroy(destroyed);

    FakeImage.created[0].load();
    expect(kept.draw).toHaveBeenCalledOnce();
    expect(destroyed.draw).not.toHaveBeenCalled();
  });
});
