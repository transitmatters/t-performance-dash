import type { Chart, Plugin } from 'chart.js';

import { getChartTheme } from '../../../utils/chartTheme';

const isLineChart = (chart: Chart) => 'type' in chart.config && chart.config.type === 'line';

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
    if (!options.enabled || !isLineChart(chart)) return;
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
    if (!options.enabled || !isLineChart(chart)) return;
    const { ctx } = chart;
    chart.tooltip?.getActiveElements().forEach(({ element }) => {
      const radius: unknown = element.options.radius;
      const backgroundColor: unknown = element.options.backgroundColor;
      // Bars, and points too faint to have a color worth echoing
      if (typeof radius !== 'number' || !radius || typeof backgroundColor !== 'string') return;
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
