import type { LabelOptions } from 'chartjs-plugin-datalabels/types/options';

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

export const DATA_LABELS_LANDING: LabelOptions = {
  align: 'right',
  anchor: 'center',
  offset: 8,
  clip: false,
  color: '#ffffffe0', // Slight opacity to add tint of line color.
  padding: {
    top: 0,
    bottom: 0,
    right: 4,
    left: 4,
  },
  borderRadius: 4,
  font: {
    size: 12,
  },
  display: (context) => {
    const lastNonNullIndex = context.dataset.data.reduce(
      (lastIndex, item, index) => (item !== null ? index : lastIndex),
      -1
    );
    return context.dataIndex === lastNonNullIndex;
  },
  formatter: (value) => `${value}%`, // Format the label content
};
