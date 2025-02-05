import type { LabelOptions } from 'chartjs-plugin-datalabels/types/options';

export const watermarkLayout = (isMobile: boolean) => {
  return {
    image: new URL('/Logo_wordmark.png', window.location.origin).toString(),
    x: 10,
    y: 10,
    opacity: 0.2,
    width: isMobile ? 120 : 160,
    height: isMobile ? 11.25 : 15,
    alignToChartArea: true,
    alignX: 'right',
    alignY: 'top',
    position: 'back',
  };
};

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
