import type { ChartType, TooltipItem, TooltipModel } from 'chart.js';

import type { SeverityTone } from '../../../utils/chartTheme';

export type HoverCardTone = SeverityTone | 'neutral';

export interface HoverCardRow {
  label: string;
  value?: string;
  // A muted second line under the value
  detail?: string;
  color?: string;
  borderColor?: string;
}

/**
 * What a chart shows on hover, as data rather than markup, so Chart.js callbacks stay plain
 * functions and the card's look lives in one place.
 */
export interface HoverCardContent {
  // Defaults to the title Chart.js builds from `callbacks.title` and the axis `tooltipFormat`
  title?: string;
  hero?: { value: string; unit?: string; caption?: string; color?: string };
  badge?: { text: string; tone: HoverCardTone };
  meter?: { fraction: number; label: string; color?: string };
  rows?: HoverCardRow[];
  chips?: { label: string; values: string[] };
  notes?: string[];
}

export type ResolvedHoverCardContent = HoverCardContent & { title: string };

declare module 'chart.js' {
  // Lives under `callbacks` because Chart.js would call any other function-valued tooltip option
  // as a scriptable option.
  interface TooltipCallbacks<
    TType extends ChartType,
    Model = TooltipModel<TType>,
    Item = TooltipItem<TType>,
  > {
    /** Structured hover card content. Without it the card is built from the text callbacks. */
    hoverCard?: (this: Model, items: Item[]) => HoverCardContent | null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- must match Chart.js's declaration to merge
  interface PluginOptionsByType<TType extends ChartType> {
    hoverHighlight?: { enabled?: boolean };
  }
}
