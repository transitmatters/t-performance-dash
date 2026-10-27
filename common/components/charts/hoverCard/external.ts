import type { Chart, ChartType, Color, Plugin, TooltipModel } from 'chart.js';

import { hideHoverCard, showHoverCard } from './hoverCardStore';
import type { HoverCardContent, HoverCardRow } from './types';

type TooltipText = Pick<
  TooltipModel<ChartType>,
  'title' | 'body' | 'labelColors' | 'beforeBody' | 'afterBody' | 'footer'
>;

const colorString = (color: Color | undefined) => (typeof color === 'string' ? color : undefined);

/**
 * Builds a card from the text the tooltip callbacks already produce, so charts without their own
 * `hoverCard` keep their content. "Label: value" lines become rows with the value aligned right,
 * and a lone value becomes the headline.
 */
export const contentFromTooltipModel = (tooltip: TooltipText): HoverCardContent => {
  const rows: HoverCardRow[] = [];
  // Charts that pack extra facts into a multi-line title keep the first line as the heading
  const [title, ...titleNotes] = tooltip.title;
  const notes: string[] = [...titleNotes, ...tooltip.beforeBody];
  tooltip.body.forEach(({ before, lines, after }, index) => {
    notes.push(...before);
    lines.forEach((line) => {
      if (!line) return;
      const split = line.indexOf(': ');
      rows.push({
        label: split === -1 ? line : line.slice(0, split),
        value: split === -1 ? undefined : line.slice(split + 2),
        color: colorString(tooltip.labelColors[index]?.backgroundColor),
        borderColor: colorString(tooltip.labelColors[index]?.borderColor),
      });
    });
    notes.push(...after);
  });
  notes.push(...tooltip.afterBody, ...tooltip.footer);

  const content: HoverCardContent = { title, notes: notes.filter(Boolean) };
  const [only] = rows;
  if (rows.length === 1 && only.value) {
    content.hero = { value: only.value, caption: only.label, color: only.color };
  } else {
    content.rows = rows;
  }
  return content;
};

/** Chart.js `external` tooltip handler that hands the hover to the shared HTML card. */
export const externalHoverCard = ({
  chart,
  tooltip,
}: {
  chart: Chart;
  tooltip: TooltipModel<ChartType>;
}) => {
  if (tooltip.opacity === 0 || !tooltip.dataPoints?.length) {
    hideHoverCard('point', chart);
    return;
  }
  const custom = tooltip.options.callbacks.hoverCard?.call(tooltip, tooltip.dataPoints);
  const content = custom === undefined ? contentFromTooltipModel(tooltip) : custom;
  const isEmpty =
    !content || (!content.hero && !content.rows?.length && !content.meter && !content.chips);
  if (isEmpty) {
    hideHoverCard('point', chart);
    return;
  }
  const canvas = chart.canvas.getBoundingClientRect();
  showHoverCard('point', {
    content: { ...content, title: content.title ?? tooltip.title[0] ?? '' },
    x: canvas.left + tooltip.caretX,
    y: canvas.top + tooltip.caretY,
    placement: 'side',
    owner: chart,
  });
};

/** Clears any card a chart left open when it unmounts, e.g. after navigating away mid-hover. */
export const hoverCardCleanupPlugin: Plugin = {
  id: 'hoverCardCleanup',
  afterDestroy: (chart) => {
    hideHoverCard('point', chart);
    hideHoverCard('annotation', chart);
  },
};
