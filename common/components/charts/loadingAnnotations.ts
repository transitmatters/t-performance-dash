import type { AnnotationOptions } from 'chartjs-plugin-annotation';
import dayjs from 'dayjs';
import type { ChartTheme } from '../../utils/chartTheme';
import type { DateChunk } from '../../utils/dateChunks';

/** Narrower than this, a span's label would spill past its shading. */
const MIN_LABEL_WIDTH_PX = 64;

const hatches = new Map<string, CanvasPattern | string>();

/** Diagonal stripes, so a span still loading doesn't read as a gap in service or as weather. */
const hatch = (color: string): CanvasPattern | string => {
  const cached = hatches.get(color);
  if (cached) return cached;
  const tile = document.createElement('canvas');
  tile.width = tile.height = 8;
  const ctx = tile.getContext('2d');
  if (!ctx) return color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-2, 10);
  ctx.lineTo(10, -2);
  ctx.stroke();
  const pattern = ctx.createPattern(tile, 'repeat') ?? color;
  hatches.set(color, pattern);
  return pattern;
};

const years = ({ startDate, endDate }: DateChunk) => {
  const [from, to] = [startDate.slice(0, 4), endDate.slice(0, 4)];
  return from === to ? from : `${from}–${to}`;
};

/** Hatched, labeled spans over the parts of a long date range that haven't arrived yet. */
export const loadingAnnotations = (
  ranges: DateChunk[],
  theme: ChartTheme
): AnnotationOptions<'box' | 'label'>[] =>
  ranges.flatMap((range) => {
    const start = dayjs(range.startDate);
    // Through the end of the last day, so it meets the next span's data without a sliver between.
    const end = dayjs(range.endDate).add(1, 'day');
    const span = { xMin: start.format('YYYY-MM-DD'), xMax: end.format('YYYY-MM-DD') };
    return [
      {
        type: 'box',
        ...span,
        backgroundColor: hatch(theme.pendingHatch),
        borderWidth: 0,
        drawTime: 'beforeDatasetsDraw',
      },
      {
        // Its own annotation rather than the box's label, which can't take a background to stay
        // legible over event markers.
        type: 'label',
        ...span,
        display: ({ chart }) => {
          const { x } = chart.scales;
          if (!x) return false;
          const width = x.getPixelForValue(end.valueOf()) - x.getPixelForValue(start.valueOf());
          return Math.abs(width) >= MIN_LABEL_WIDTH_PX;
        },
        content: ['Loading', years(range)],
        color: theme.tick,
        backgroundColor: theme.surface,
        borderRadius: 4,
        padding: 6,
        font: { size: 12 },
      },
    ];
  });
