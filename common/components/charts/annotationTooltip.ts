import type { Plugin } from 'chart.js';
import Annotation from 'chartjs-plugin-annotation';

import { hideHoverCard, showHoverCard, useHoverCardStore } from './hoverCard/hoverCardStore';

export type AnnotationTooltipContent = { title: string; lines: string[] };

type Hook = () => void;

const cards = new WeakMap<Hook, AnnotationTooltipContent>();

/**
 * Gives a box annotation a hover card, shown by annotationHoverCardPlugin. The annotation plugin's
 * own enter/leave can't drive it: they inherit each chart's `interaction`, and with the usual
 * `intersect: false` a box counts as hovered anywhere on the plot, so its card never closed.
 */
export const annotationTooltip = (content: AnnotationTooltipContent) => {
  // Annotation elements drop unknown options but keep their event hooks as-is, so the hook doubles
  // as the key to this box's card
  const enter: Hook = () => {};
  cards.set(enter, content);
  return { enter };
};

/** Shows the card for whichever annotation box is under the pointer. */
export const annotationHoverCardPlugin: Plugin = {
  id: 'annotationHoverCard',
  afterEvent: (chart, { event }) => {
    const { x, y } = event;
    const hit =
      event.type === 'mousemove' && x !== null && y !== null
        ? Annotation.getAnnotations(chart).find(
            (element) =>
              cards.has(element.options.enter as Hook) &&
              (element as unknown as { inRange: (x: number, y: number) => boolean }).inRange(x, y)
          )
        : undefined;
    const content = hit && cards.get(hit.options.enter as Hook);
    if (!hit || !content) {
      hideHoverCard('annotation', chart);
      return;
    }
    const canvas = chart.canvas.getBoundingClientRect();
    const anchor = { x: canvas.left + hit.centerX, y: canvas.top + hit.y };
    const current = useHoverCardStore.getState().annotation;
    if (current?.owner === chart && current.x === anchor.x && current.y === anchor.y) return;
    showHoverCard('annotation', {
      content: { title: content.title, notes: content.lines },
      ...anchor,
      placement: 'above',
      owner: chart,
    });
  },
};
