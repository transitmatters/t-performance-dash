import type { EventContext } from 'chartjs-plugin-annotation';

const TOOLTIP_ID = 'tm-annotation-tooltip';

export type AnnotationTooltipContent = { title: string; lines: string[] };

/**
 * Hover handlers for a Chart.js box annotation that show a small card above it. The card is a plain
 * element on the page rather than React state, so hovering doesn't re-render the chart under it.
 */
export const annotationTooltip = ({ title, lines }: AnnotationTooltipContent) => ({
  enter: ({ chart, element }: EventContext) => {
    const canvas = chart.canvas.getBoundingClientRect();
    let tooltip = document.getElementById(TOOLTIP_ID);
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = TOOLTIP_ID;
      tooltip.setAttribute('role', 'tooltip');
      tooltip.className =
        'pointer-events-none fixed z-50 max-w-xs -translate-x-1/2 -translate-y-full rounded-md border border-border bg-popover p-2 text-xs text-popover-foreground shadow-md';
      document.body.appendChild(tooltip);
    }
    const heading = document.createElement('p');
    heading.className = 'font-medium';
    heading.textContent = title;
    tooltip.replaceChildren(
      heading,
      ...lines.map((line) => {
        const p = document.createElement('p');
        p.className = 'text-muted-foreground';
        p.textContent = line;
        return p;
      })
    );
    tooltip.style.left = `${canvas.left + element.centerX}px`;
    tooltip.style.top = `${canvas.top + element.y - 4}px`;
  },
  leave: () => {
    document.getElementById(TOOLTIP_ID)?.remove();
  },
});
