/**
 * The faint TransitMatters wordmark on every chart and line map. Chart.js charts get it from
 * watermarkPlugin; stripmap maps from getStripMapWatermark.
 */
export const WATERMARK = {
  // The charcoal wordmark vanishes against a dark surface, so the dark theme gets the white one.
  src: { light: '/Logo_wordmark.png', dark: '/Logo_wordmark_white.png' },
  opacity: 0.2,
  /** Gap between the wordmark and the corner of the plot, in CSS pixels. */
  inset: 10,
} as const;

/** The wordmark's drawn size in CSS pixels: smaller on phones. */
export const watermarkSize = (isMobile: boolean) =>
  isMobile ? { width: 120, height: 11.25 } : { width: 160, height: 15 };
