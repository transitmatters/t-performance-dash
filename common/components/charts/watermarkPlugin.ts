import type { Chart, ChartType, Plugin } from 'chart.js';
import { BREAKPOINTS } from '../../constants/breakpoints';
import { WATERMARK, watermarkSize } from '../../constants/charts';

export interface WatermarkOptions {
  /**
   * `plot` (the default) sets the wordmark in the plot area's top-right corner, behind the data.
   * `below` sets it in the canvas's bottom-right corner, for charts whose labels can reach that
   * corner of the plot; give such a chart `watermarkSize(isMobile).height` of bottom padding.
   */
  placement?: 'plot' | 'below';
}

declare module 'chart.js' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- merging needs Chart.js's own type parameter
  interface PluginOptionsByType<TType extends ChartType> {
    /** `false` leaves the wordmark off this chart. */
    watermark?: WatermarkOptions | false;
  }
}

type Theme = keyof typeof WATERMARK.src;

const images = new Map<Theme, HTMLImageElement>();
/** Charts that drew before the wordmark had loaded, to draw again once it has. */
const waiting = new Set<Chart>();

const getImage = (theme: Theme): HTMLImageElement => {
  let image = images.get(theme);
  if (!image) {
    image = new Image();
    image.addEventListener('load', () => {
      waiting.forEach((chart) => chart.draw());
      waiting.clear();
    });
    image.src = WATERMARK.src[theme];
    images.set(theme, image);
  }
  return image;
};

/**
 * The theme on screen. Embeds set it from their `?theme=` without touching the stored preference,
 * so read the `dark` class rather than the theme store.
 */
const currentTheme = (): Theme =>
  document.documentElement.classList.contains('dark') ? 'dark' : 'light';

const isNarrowViewport = () => !window.matchMedia(`(min-width: ${BREAKPOINTS.md})`).matches;

/** Top-left corner of the wordmark, in the chart's CSS pixels. */
export const watermarkPosition = (
  chart: Pick<Chart, 'chartArea' | 'width' | 'height'>,
  placement: WatermarkOptions['placement'],
  size: { width: number; height: number }
): { x: number; y: number } =>
  placement === 'below'
    ? { x: chart.width - size.width, y: chart.height - size.height }
    : {
        x: chart.chartArea.right - WATERMARK.inset - size.width,
        y: chart.chartArea.top + WATERMARK.inset,
      };

/**
 * Draws the TransitMatters wordmark on every Chart.js chart, so a chart shared as a screenshot
 * still says where it came from. Registered once in setupCharts, so a new chart gets it without
 * opting in. The theme and viewport are read each time the chart draws, not when it's created:
 * a chart that updates in place across a theme change would otherwise keep the old wordmark.
 */
export const watermarkPlugin: Plugin<ChartType, WatermarkOptions> = {
  id: 'watermark',
  defaults: { placement: 'plot' },
  beforeDraw: (chart, _args, options) => {
    const image = getImage(currentTheme());
    if (!image.complete) {
      waiting.add(chart);
      return;
    }
    if (!image.naturalWidth) return;
    const size = watermarkSize(isNarrowViewport());
    const { x, y } = watermarkPosition(chart, options.placement, size);
    const { ctx } = chart;
    ctx.save();
    ctx.globalAlpha = WATERMARK.opacity;
    ctx.drawImage(image, x, y, size.width, size.height);
    ctx.restore();
  },
  afterDestroy: (chart) => {
    waiting.delete(chart);
  },
};
