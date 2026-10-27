import type { Plugin } from 'chart.js';

import { getChartTheme } from '../../../utils/chartTheme';

/**
 * Marks what the hover card is reading on line charts: a faint vertical rule through the hovered
 * x, and a ring around each hovered point. The card sits beside the point rather than on it, so
 * without these nothing on the plot shows which point it describes. Turn both off per chart with
 * `plugins.hoverHighlight.enabled: false`.
 */
export const hoverHighlightPlugin: Plugin<'line', { enabled?: boolean }> = {
  id: 'hoverHighlight',
  defaults: { enabled: true },
  beforeDatasetsDraw: (chart, _args, options) => {
    if (!options.enabled || (chart.config as { type?: string }).type !== 'line') return;
    const [active] = chart.tooltip?.getActiveElements() ?? [];
    if (!active) return;
    const { top, bottom } = chart.chartArea;
    const x = Math.round(active.element.x) + 0.5;
    const { ctx } = chart;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.lineWidth = 1;
    ctx.strokeStyle = getChartTheme().axisBorder;
    ctx.stroke();
    ctx.restore();
  },
  afterDatasetsDraw: (chart, _args, options) => {
    if (!options.enabled || (chart.config as { type?: string }).type !== 'line') return;
    const { ctx } = chart;
    chart.tooltip?.getActiveElements().forEach(({ element }) => {
      const { radius, backgroundColor } = element.options as {
        radius?: number;
        backgroundColor?: unknown;
      };
      // Bars, and points too faint to have a color worth echoing
      if (!radius || typeof backgroundColor !== 'string') return;
      ctx.save();
      ctx.beginPath();
      ctx.arc(element.x, element.y, radius + 3, 0, Math.PI * 2);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = backgroundColor;
      ctx.stroke();
      ctx.restore();
    });
  },
};
