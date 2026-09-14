import type { Chart } from 'chart.js';
import dayjs from 'dayjs';
import type { Location } from '../types/charts';
import { LINE_COLORS, LINE_COLORS_ON_DARK } from '../constants/colors';
import { SMALL_DATE_FORMAT } from '../constants/dates';
import { useThemeStore } from '../state/themeStore';

/**
 * The chart is copied out of a canvas Chart.js has already painted, using whichever theme was
 * active. Composited onto a fixed white sheet, a dark-theme plot arrived with ~2.3:1 axis labels
 * and gridlines that had vanished entirely — a broken image the author only finds out about from a
 * reader. The sheet follows the theme instead, so what gets exported is what was on screen.
 */
interface ImageTheme {
  background: string;
  title: string;
  subtitle: string;
  meta: string;
  footer: string;
  lineColors: typeof LINE_COLORS;
}

const IMAGE_LIGHT: ImageTheme = {
  background: '#ffffff',
  title: '#1c1917',
  subtitle: '#57534e',
  meta: '#44403c',
  footer: '#78716c',
  lineColors: LINE_COLORS,
};

const IMAGE_DARK: ImageTheme = {
  background: '#171717',
  title: '#fafaf9',
  subtitle: '#a8a29e',
  meta: '#d6d3d1',
  footer: '#a8a29e',
  lineColors: LINE_COLORS_ON_DARK,
};

const getImageTheme = (): ImageTheme =>
  useThemeStore.getState().theme === 'dark' ? IMAGE_DARK : IMAGE_LIGHT;

const CHART_TITLES: Record<string, string> = {
  headways: 'Headways',
  traveltimes: 'Travel Times',
  dwells: 'Dwells',
  speeds: 'Speed',
  speed: 'Speed',
  ridership: 'Ridership',
  'ridership predictions': 'Arrival Predictions',
  service: 'Service',
};

const CHART_SUBTITLES: Record<string, string> = {
  headways: 'Time between trains',
  traveltimes: 'Time between stops',
  dwells: 'Time spent at station',
  speeds: 'Average speed between stops',
  speed: 'Average speed between stops',
};

export function getChartTitle(datasetName: string): string {
  return CHART_TITLES[datasetName] ?? datasetName;
}

function getChartSubtitle(datasetName: string): string | undefined {
  return CHART_SUBTITLES[datasetName];
}

function formatDateForImage(startDate: string, endDate?: string): string {
  const start = dayjs(startDate).format(SMALL_DATE_FORMAT);
  if (endDate) {
    return `${start} — ${dayjs(endDate).format(SMALL_DATE_FORMAT)}`;
  }
  return start;
}

export interface ChartImageOptions {
  datasetName: string;
  startDate: string;
  endDate?: string;
  location?: Location;
  line?: string;
  includeBothStopsForLocation?: boolean;
  chartTitle?: string;
}

/**
 * Export a Chart.js chart as a PNG image with a header matching
 * the on-screen WidgetTitle layout and a URL footer.
 */
export function downloadChartAsImage(chart: Chart, options: ChartImageOptions, filename: string) {
  const {
    datasetName,
    startDate,
    endDate,
    location,
    line,
    includeBothStopsForLocation,
    chartTitle,
  } = options;
  const { canvas } = chart;
  const { width, height } = canvas;

  // Chart.js renders at devicePixelRatio, so canvas dimensions are already
  // scaled (e.g. 2x on retina). Scale our text/spacing to match.
  const dpr = window.devicePixelRatio || 1;

  const headerHeight = 72 * dpr;
  const headerPadding = 16 * dpr;
  const footerHeight = 36 * dpr;
  const footerPadding = 8 * dpr;

  const titleFontSize = 20 * dpr;
  const subtitleFontSize = 14 * dpr;
  const dateFontSize = 14 * dpr;
  const locationFontSize = 16 * dpr;
  const footerFontSize = 12 * dpr;

  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = headerHeight + height + footerHeight;

  const ctx = offscreen.getContext('2d');
  if (!ctx) return;

  const theme = getImageTheme();

  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, offscreen.width, offscreen.height);

  // --- Header: Left side (title + subtitle) ---
  const title = chartTitle ?? getChartTitle(datasetName);
  const subtitle = getChartSubtitle(datasetName);

  ctx.fillStyle = theme.title;
  ctx.font = `bold ${titleFontSize}px system-ui, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(title, headerPadding, headerPadding);

  if (subtitle) {
    ctx.fillStyle = theme.subtitle;
    ctx.font = `italic ${subtitleFontSize}px system-ui, sans-serif`;
    ctx.fillText(subtitle, headerPadding, headerPadding + titleFontSize + 4 * dpr);
  }

  // --- Header: Right side (date + location) ---
  const dateStr = formatDateForImage(startDate, endDate);
  ctx.fillStyle = theme.meta;
  ctx.font = `${dateFontSize}px system-ui, sans-serif`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(dateStr, width - headerPadding, headerPadding);

  if (location) {
    const lineColor =
      theme.lineColors[line as keyof typeof LINE_COLORS] ?? theme.lineColors.default;
    const locationY = headerPadding + dateFontSize + 4 * dpr;
    const rightEdge = width - headerPadding;

    if (includeBothStopsForLocation) {
      const toText = ' to ';

      // Measure segments right-to-left
      ctx.font = `bold ${locationFontSize}px system-ui, sans-serif`;
      const toStationWidth = ctx.measureText(location.to).width;
      const fromWidth = ctx.measureText(location.from).width;
      ctx.font = `${locationFontSize}px system-ui, sans-serif`;
      const toTextWidth = ctx.measureText(toText).width;

      // Draw "to" station (bold, line color)
      ctx.font = `bold ${locationFontSize}px system-ui, sans-serif`;
      ctx.fillStyle = lineColor;
      ctx.textAlign = 'left';
      ctx.fillText(location.to, rightEdge - toStationWidth, locationY);

      // Draw " to " (normal weight, dark)
      ctx.font = `${locationFontSize}px system-ui, sans-serif`;
      ctx.fillStyle = theme.meta;
      ctx.fillText(toText, rightEdge - toStationWidth - toTextWidth, locationY);

      // Draw "from" station (bold, line color)
      ctx.font = `bold ${locationFontSize}px system-ui, sans-serif`;
      ctx.fillStyle = lineColor;
      ctx.fillText(location.from, rightEdge - toStationWidth - toTextWidth - fromWidth, locationY);
    } else {
      // Single station (headways, dwells) — show origin + direction
      ctx.font = `${locationFontSize}px system-ui, sans-serif`;
      const dirWidth = ctx.measureText(` ${location.direction}`).width;
      ctx.font = `bold ${locationFontSize}px system-ui, sans-serif`;
      const fromWidth = ctx.measureText(location.from).width;

      // Draw direction (normal weight, dark)
      ctx.font = `${locationFontSize}px system-ui, sans-serif`;
      ctx.fillStyle = theme.meta;
      ctx.textAlign = 'left';
      ctx.fillText(` ${location.direction}`, rightEdge - dirWidth, locationY);

      // Draw station name (bold, line color)
      ctx.font = `bold ${locationFontSize}px system-ui, sans-serif`;
      ctx.fillStyle = lineColor;
      ctx.fillText(location.from, rightEdge - dirWidth - fromWidth, locationY);
    }
  }

  // --- Chart ---
  ctx.drawImage(canvas, 0, headerHeight);

  // --- Footer: URL ---
  const url = window.location.href;
  ctx.fillStyle = theme.footer;
  ctx.font = `${footerFontSize}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const footerY = headerHeight + height + footerPadding + footerHeight / 2 - footerPadding / 2;
  ctx.fillText(url, width / 2, footerY);

  // Trigger download
  const link = document.createElement('a');
  link.download = filename;
  link.href = offscreen.toDataURL('image/png');
  link.click();
}
