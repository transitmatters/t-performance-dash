import { useMemo } from 'react';
import { Chart } from '@chartjs-utils';
import type { AnnotationOptions, AnnotationTypeRegistry } from 'chartjs-plugin-annotation';
import type { MajorEvent } from '../constants/majorEvents';
import { MAJOR_EVENTS } from '../constants/majorEvents';
import { CHART_COLORS } from '../constants/colors';
import type { Line } from '../types/lines';
import type { Block } from '../components/charts/TimeSeriesChart/types';
import { useMajorEventsStore } from '../state/majorEventsStore';
import { hexWithAlpha } from './general';

const EVENT_COLOR = CHART_COLORS.GREY;

/**
 * Whether `event` falls on any day from `from` to `to`. Dates are YYYY-MM-DD strings or ISO
 * timestamps, so they compare correctly as strings. A missing bound is open.
 */
const overlaps = (event: MajorEvent, from?: string, to?: string) =>
  (!to || event.start <= to.slice(0, 10)) &&
  (!from || (event.end ?? event.start) >= from.slice(0, 10));

/**
 * Events to mark on a chart of `lines` from `startDate` to `endDate`.
 *
 * A chart of several lines leaves off events that hit only one of them: those belong on that
 * line's own charts, and there they'd crowd out the ones that explain the whole chart. A chart
 * that isn't about particular lines (`undefined`) gets only the events that affected every mode.
 */
export const getMajorEvents = (
  lines: Line | Line[] | undefined,
  startDate?: string,
  endDate?: string
): MajorEvent[] => {
  const shownLines = lines === undefined ? [] : [lines].flat();
  const minLinesHit = Math.min(2, shownLines.length);
  return MAJOR_EVENTS.filter(
    (event) =>
      (!event.lines ||
        (minLinesHit > 0 &&
          event.lines.filter((line) => shownLines.includes(line)).length >= minLinesHit)) &&
      overlaps(event, startDate, endDate)
  );
};

/**
 * getMajorEvents, or none when the reader has turned event markers off in the page controls.
 * `lines` should be a stable reference (a constant or memoized array), since it's a memo dependency.
 */
export const useMajorEvents = (
  lines: Line | Line[] | undefined,
  startDate?: string,
  endDate?: string
): MajorEvent[] => {
  const showEvents = useMajorEventsStore((state) => state.showEvents);
  return useMemo(
    () => (showEvents ? getMajorEvents(lines, startDate, endDate) : []),
    [showEvents, lines, startDate, endDate]
  );
};

/**
 * Whether one of `events` spans part of a gap in the data from `from` to `to`, so its caption
 * already says why the data is missing.
 */
export const explainsGap = (events: MajorEvent[], from?: string, to?: string) =>
  events.some((event) => event.end && overlaps(event, from, to));

type Annotation = AnnotationOptions<keyof AnnotationTypeRegistry>;

const isNoDataGap = (annotation: Annotation) =>
  annotation.type === 'box' && annotation.label?.content === 'No data';

/**
 * Drops the "No data" caption from gaps an event spans, since the event's caption says why.
 * Runs after the shutdown captions, so a gap a shutdown already explains keeps its own label.
 */
export const hideGapsExplainedByEvents = (gaps: Annotation[], events: MajorEvent[]) =>
  gaps.map((gap) =>
    gap.type === 'box' &&
    isNoDataGap(gap) &&
    explainsGap(events, gap.xMin as string | undefined, gap.xMax as string | undefined)
      ? ({ ...gap, label: { ...gap.label, display: false } } as Annotation)
      : gap
  );

/** The same, for TimeSeriesChart blocks: an unset label is the default "No data". */
export const hideBlocksExplainedByEvents = (blocks: Block[], events: MajorEvent[]) =>
  blocks.map((block) =>
    block.label === undefined && explainsGap(events, block.from, block.to)
      ? { ...block, label: '' }
      : block
  );

const LABEL_FONT_SIZE = 11;
const LABEL_LINE_HEIGHT = 1.2; // Chart.js's default
const LABEL_PADDING = 4;
const LABEL_GAP = 3;
const LABEL_HALO_WIDTH = 3;

/**
 * The caption runs down the chart, so its length is capped by the chart's height, which on a
 * phone is too short for most captions. Break it onto more lines only when it doesn't fit.
 */
const fitToChartHeight = (chart: Chart, text: string): string | string[] => {
  const { ctx, chartArea } = chart;
  if (!chartArea) return text;
  const maxLength = chartArea.height - 2 * LABEL_PADDING;
  ctx.save();
  ctx.font = `${LABEL_FONT_SIZE}px ${Chart.defaults.font.family}`;
  const fits = (line: string) => ctx.measureText(line).width <= maxLength;
  const lines: string[] = [];
  if (fits(text)) {
    lines.push(text);
  } else {
    text.split(' ').forEach((word) => {
      const last = lines.length - 1;
      if (last >= 0 && fits(`${lines[last]} ${word}`)) lines[last] = `${lines[last]} ${word}`;
      else lines.push(word);
    });
  }
  ctx.restore();
  return lines.length === 1 ? lines[0] : lines;
};

/**
 * Chart.js annotations for `events`. Each event gets a dashed line on its first day, captioned
 * from the top of the chart; an event that spans a period also shades the days it covers.
 *
 * The caption is rotated to run down the line, so captions of nearby events sit side by side
 * instead of on top of each other. It's drawn over the data, so filled charts and "No data"
 * blocks can't hide it, with a white halo instead of a box, so data lines show between letters.
 */
export const getMajorEventAnnotations = (
  events: MajorEvent[]
): AnnotationOptions<keyof AnnotationTypeRegistry>[] =>
  events.flatMap((event) => {
    const marker: AnnotationOptions<'line'> = {
      type: 'line',
      xMin: event.start,
      xMax: event.start,
      borderColor: hexWithAlpha(EVENT_COLOR, 0.6),
      borderWidth: 1,
      borderDash: [4, 4],
      label: {
        display: true,
        content: ({ chart }) => fitToChartHeight(chart, event.label),
        position: 'start',
        rotation: -90,
        // Shift the caption by half its thickness plus a gap, so it sits beside the line.
        xAdjust: ({ chart }) => {
          const lines = [fitToChartHeight(chart, event.label)].flat().length;
          return (lines * LABEL_FONT_SIZE * LABEL_LINE_HEIGHT) / 2 + 1 + LABEL_GAP;
        },
        color: EVENT_COLOR,
        backgroundColor: 'transparent',
        textStrokeColor: hexWithAlpha('#ffffff', 0.9),
        textStrokeWidth: LABEL_HALO_WIDTH,
        font: { size: LABEL_FONT_SIZE, weight: 'normal', lineHeight: LABEL_LINE_HEIGHT },
        padding: { x: LABEL_PADDING, y: 1 },
      },
    };
    if (!event.end) return [marker];
    const band: AnnotationOptions<'box'> = {
      type: 'box',
      xMin: event.start,
      xMax: event.end,
      backgroundColor: hexWithAlpha(EVENT_COLOR, 0.08),
      borderWidth: 0,
      // Shade behind the data, not over it.
      drawTime: 'beforeDatasetsDraw',
    };
    return [band, marker];
  });
