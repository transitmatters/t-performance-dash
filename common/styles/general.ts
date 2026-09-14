import type { CSSProperties } from 'react';
import { LINE_COLORS, LINE_COLORS_DARK } from '../constants/colors';
import type { Line } from '../types/lines';
import type { DefaultStyleMap } from '../types/styles';

/**
 * Tailwind v4 removed the `*-opacity-*` utilities, so a dynamic line color can no longer be paired
 * with a separate opacity class. Exposing the line color as a CSS variable lets any component ask
 * for it at any alpha: `bg-(--line-color)/75`, `hover:border-(--line-color)/50`, and so on.
 * The variable inherits, so setting it on a container covers its children.
 */
export const lineColorVar = (line?: Line | null): CSSProperties =>
  ({
    '--line-color': LINE_COLORS[line ?? 'default'],
    '--line-color-dark': LINE_COLORS_DARK[line ?? 'default'],
  }) as CSSProperties;

export const lineColorBackground: DefaultStyleMap = {
  'line-red': `bg-mbta-red`,
  'line-orange': `bg-mbta-orange`,
  'line-green': `bg-mbta-green`,
  'line-blue': `bg-mbta-blue`,
  'line-mattapan': `bg-mbta-red`,
  'line-bus': `bg-mbta-bus`,
  'line-commuter-rail': `bg-mbta-commuterRail`,
  'line-ferry': `bg-mbta-ferry`,
  'line-RIDE': `bg-mbta-bus`,
  DEFAULT: `bg-stone-800`,
};

export const lineColorLightBorder: DefaultStyleMap = {
  'line-red': `border-mbta-lightRed`,
  'line-orange': `border-mbta-lightOrange`,
  'line-green': `border-mbta-lightGreen`,
  'line-blue': `border-mbta-lightBlue`,
  'line-mattapan': `border-mbta-lightRed`,
  'line-bus': `border-mbta-lightBus`,
  'line-commuter-rail': `border-mbta-lightCommuterRail`,
  'line-ferry': `border-mbta-lightFerry`,
  'line-RIDE': `border-mbta-lightBus`,
  DEFAULT: `border-stone-900`,
};

export const mbtaTextConfig: DefaultStyleMap = {
  'line-red': `text-mbta-red`,
  'line-orange': `text-mbta-orange`,
  'line-green': `text-mbta-green`,
  'line-blue': `text-mbta-blue`,
  'line-mattapan': `text-mbta-red`,
  'line-bus': `text-mbta-bus`,
  'line-commuter-rail': `text-mbta-commuterRail`,
  'line-ferry': `text-mbta-ferry`,
  'line-RIDE': `text-mbta-bus`,
  DEFAULT: `text-black`,
};

export const lineColorLightBackground: DefaultStyleMap = {
  'line-red': `bg-mbta-lightRed`,
  'line-orange': `bg-mbta-lightOrange`,
  'line-green': `bg-mbta-lightGreen`,
  'line-blue': `bg-mbta-lightBlue`,
  'line-mattapan': `bg-mbta-lightRed`,
  'line-bus': `bg-mbta-lightBus`,
  'line-commuter-rail': `bg-mbta-lightCommuterRail`,
  'line-ferry': `bg-mbta-lightFerry`,
  'line-RIDE': `bg-mbta-lightBus`,
  DEFAULT: `bg-stone-900`,
};

export const lineColorDarkBackground: DefaultStyleMap = {
  'line-red': `bg-mbta-darkRed`,
  'line-orange': `bg-mbta-darkOrange`,
  'line-green': `bg-mbta-darkGreen`,
  'line-blue': `bg-mbta-darkBlue`,
  'line-mattapan': `bg-mbta-darkRed`,
  'line-bus': `bg-mbta-darkBus`,
  'line-commuter-rail': `bg-mbta-darkCommuterRail`,
  'line-ferry': `bg-mbta-darkFerry`,
  'line-RIDE': `bg-mbta-darkBus`,
  DEFAULT: `bg-stone-900`,
};

/**
 * Focus ring for controls sitting ON the line-colored header band. These used to ring in the line's
 * own color — `focus:ring-mbta-red` on a `bg-mbta-red` header, i.e. 1.00:1, an indicator that could
 * not be seen at all. The ring has to contrast with the band behind it and with the control's own
 * darker fill, so it resolves to white or near-black by the same rule that picks the label color.
 * Every pair below clears 3:1 against both.
 */
export const buttonHighlightFocus: DefaultStyleMap = {
  'line-red': `focus-visible:ring-white`,
  'line-orange': `focus-visible:ring-stone-900`,
  'line-green': `focus-visible:ring-white`,
  'line-blue': `focus-visible:ring-white`,
  'line-mattapan': `focus-visible:ring-white`,
  'line-bus': `focus-visible:ring-stone-900`,
  'line-commuter-rail': `focus-visible:ring-white`,
  'line-ferry': `focus-visible:ring-white`,
  'line-RIDE': `focus-visible:ring-stone-900`,
  DEFAULT: `focus-visible:ring-white`,
};

/**
 * Focus ring for controls on a plain card or white ground, where a line color cannot be trusted —
 * bus yellow rings at 1.8:1 on white. Neutral, and flipped for the dark theme.
 */
export const FOCUS_RING_ON_SURFACE =
  'focus-visible:ring-2 focus-visible:ring-stone-900 dark:focus-visible:ring-stone-100 focus-visible:outline-hidden';

export const lineColorTextHover: DefaultStyleMap = {
  'line-red': `hover:text-mbta-red`,
  'line-orange': `hover:text-mbta-orange`,
  'line-green': `hover:text-mbta-green`,
  'line-blue': `hover:text-mbta-blue`,
  'line-mattapan': `hover:text-mbta-red`,
  'line-bus': `hover:text-mbta-bus`,
  'line-commuter-rail': `hover:text-mbta-commuterRail`,
  'line-ferry': `hover:text-mbta-ferry`,
  'line-RIDE': `hover:text-mbta-bus`,
  DEFAULT: `hover:text-stone-800`,
};

export const lineColorDarkBorder: DefaultStyleMap = {
  'line-red': `border-mbta-darkRed`,
  'line-orange': `border-mbta-darkOrange`,
  'line-green': `border-mbta-darkGreen`,
  'line-blue': `border-mbta-darkBlue`,
  'line-mattapan': `border-mbta-darkRed`,
  'line-bus': `border-mbta-darkBus`,
  'line-commuter-rail': `border-mbta-darkCommuterRail`,
  'line-ferry': `border-mbta-darkFerry`,
  'line-RIDE': `border-mbta-darkBus`,
  DEFAULT: `border-stone-900`,
};

export const lineColorBorder: DefaultStyleMap = {
  'line-red': `border-mbta-red`,
  'line-orange': `border-mbta-orange`,
  'line-green': `border-mbta-green`,
  'line-blue': `border-mbta-blue`,
  'line-mattapan': `border-mbta-red`,
  'line-bus': `border-mbta-bus`,
  'line-commuter-rail': `border-mbta-commuterRail`,
  'line-ferry': `border-mbta-ferry`,
  'line-RIDE': `border-mbta-bus`,
  DEFAULT: `border-stone-800`,
};

export const lineColorText: DefaultStyleMap = {
  'line-red': `text-mbta-red`,
  'line-orange': `text-mbta-orange`,
  'line-green': `text-mbta-green`,
  'line-blue': `text-mbta-blue`,
  'line-mattapan': `text-mbta-red`,
  'line-bus': `text-mbta-bus`,
  'line-commuter-rail': `text-mbta-commuterRail`,
  'line-ferry': `text-mbta-ferry`,
  'line-RIDE': `text-mbta-bus`,
  DEFAULT: `text-stone-800`,
};

export const lineColorRing: DefaultStyleMap = {
  'line-red': `ring-mbta-red`,
  'line-orange': `ring-mbta-orange`,
  'line-green': `ring-mbta-green`,
  'line-blue': `ring-mbta-blue`,
  'line-mattapan': `ring-mbta-red`,
  'line-bus': `ring-mbta-bus`,
  'line-commuter-rail': `ring-mbta-commuterRail`,
  'line-ferry': `ring-mbta-ferry`,
  'line-RIDE': `ring-mbta-bus`,
  DEFAULT: `ring-stone-800`,
};
