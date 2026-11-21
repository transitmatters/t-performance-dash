import type { CSSProperties } from 'react';
import { LINE_COLORS, LINE_COLORS_DARK } from '../constants/colors';
import type { LineColorKey } from '../types/lines';
import type { LineColorStyleMap } from '../types/styles';
import { readableOn } from '../utils/general';

/** Whether text on a solid fill of the line's color has to be dark: bus yellow can't carry white. */
export const needsDarkTextOn = (line?: LineColorKey | null) =>
  readableOn(LINE_COLORS[line ?? 'default']) === 'dark';

/** The readable text color for a solid fill of the line's color. */
export const textOnLineColor = (line?: LineColorKey | null) =>
  needsDarkTextOn(line) ? 'text-stone-900' : 'text-white';

/**
 * Tailwind v4 removed the `*-opacity-*` utilities, so a dynamic line color can no longer be paired
 * with a separate opacity class. Exposing the line color as a CSS variable lets any component ask
 * for it at any alpha: `bg-(--line-color)/75`, `hover:border-(--line-color)/50`, and so on.
 * The variable inherits, so setting it on a container covers its children.
 */
export const lineColorVar = (line?: LineColorKey | null): CSSProperties =>
  ({
    '--line-color': LINE_COLORS[line ?? 'default'],
    '--line-color-dark': LINE_COLORS_DARK[line ?? 'default'],
  }) as CSSProperties;

export const lineColorBackground: LineColorStyleMap = {
  'line-red': `bg-mbta-red`,
  'line-orange': `bg-mbta-orange`,
  'line-green': `bg-mbta-green`,
  'line-blue': `bg-mbta-blue`,
  'line-mattapan': `bg-mbta-red`,
  'line-bus': `bg-mbta-bus`,
  'line-commuter-rail': `bg-mbta-commuterRail`,
  'line-ferry': `bg-mbta-ferry`,
  'line-RIDE': `bg-mbta-bus`,
  'line-silver': `bg-mbta-silver`,
  DEFAULT: `bg-stone-800`,
};

export const mbtaTextConfig: LineColorStyleMap = {
  'line-red': `text-mbta-red`,
  'line-orange': `text-mbta-orange`,
  'line-green': `text-mbta-green`,
  'line-blue': `text-mbta-blue`,
  'line-mattapan': `text-mbta-red`,
  'line-bus': `text-mbta-bus`,
  'line-commuter-rail': `text-mbta-commuterRail`,
  'line-ferry': `text-mbta-ferry`,
  'line-RIDE': `text-mbta-bus`,
  'line-silver': `text-mbta-silver`,
  DEFAULT: `text-black`,
};

/**
 * Focus ring for controls on a plain card or white ground, where a line color cannot be trusted —
 * bus yellow rings at 1.8:1 on white. Neutral, and flipped for the dark theme.
 */
export const FOCUS_RING_ON_SURFACE =
  'focus-visible:ring-2 focus-visible:ring-stone-900 dark:focus-visible:ring-stone-100 focus-visible:outline-hidden';

/**
 * A menu button in the line-colored page header, like the line and route switchers. The ring
 * follows the text color, since a fixed one drops under 3:1 on some line colors.
 */
export const headingMenuTrigger = (line?: LineColorKey | null) =>
  `inline-flex items-center gap-x-1.5 rounded-md px-1.5 py-0.5 focus-visible:ring-2 focus-visible:outline-hidden ${
    needsDarkTextOn(line)
      ? 'bg-black/5 hover:bg-black/15 focus-visible:ring-stone-900'
      : 'bg-white/10 hover:bg-white/20 focus-visible:ring-white'
  }`;

/**
 * The one look for page controls, whether they sit on the line-colored band or the neutral bar:
 * a light field with dark text, so contrast never depends on the line color behind it.
 */
export const CONTROL_SURFACE =
  'border border-stone-200 bg-white text-stone-900 shadow-xs hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800';
