import type { AnnotationOptions } from 'chartjs-plugin-annotation';
import dayjs from 'dayjs';
import { TWELVE_HOURS } from '../../../constants/time';
import { hexWithAlpha } from '../../../utils/general';
import type { TripSlowZoneRun } from '../../../utils/slowZoneUtils';
import { getFormattedTimeString } from '../../../utils/time';
import type { HoverCardRow, ResolvedHoverCardContent } from '../hoverCard/types';

/** A run of slow zone days placed on a daily chart's x axis, in epoch milliseconds. */
export interface PlacedSlowZoneRun extends TripSlowZoneRun {
  from: number;
  to: number;
}

// Daily charts plot each day's point at midnight, so a day's run sits half a day earlier
const DAILY_OFFSET = TWELVE_HOURS;
const MAX_SHADING_ALPHA = 0.22;
const MIN_SHADING_ALPHA = 0.04;
const MAX_CARD_ZONES = 5;

export const placeSlowZoneRuns = (runs: TripSlowZoneRun[]): PlacedSlowZoneRun[] =>
  runs.map((run) => ({
    ...run,
    from: dayjs(run.start).valueOf() - DAILY_OFFSET,
    to: dayjs(run.end).add(1, 'day').valueOf() - DAILY_OFFSET,
  }));

export const slowZoneRunAt = (runs: PlacedSlowZoneRun[], time: number) =>
  runs.find(({ from, to }) => time >= from && time < to);

const zoneCount = (run: TripSlowZoneRun) =>
  `${run.zones.length} ${run.zones.length === 1 ? 'zone' : 'zones'}`;

/** The slow zone time on a hovered day, as a row for the chart's popover. */
export const slowZoneRowAt = (
  runs: PlacedSlowZoneRun[],
  time: number,
  color: string
): HoverCardRow | undefined => {
  const run = slowZoneRunAt(runs, time);
  if (!run) return undefined;
  return {
    label: 'Slow zones',
    value: `+${getFormattedTimeString(run.total)}`,
    detail: zoneCount(run),
    color,
  };
};

const formatRunDates = ({ start, end }: TripSlowZoneRun) => {
  const from = dayjs(start);
  const to = dayjs(end);
  if (from.isSame(to, 'day')) return from.format('ddd, MMM D, YYYY');
  return from.isSame(to, 'year')
    ? `${from.format('MMM D')} – ${to.format('MMM D, YYYY')}`
    : `${from.format('MMM D, YYYY')} – ${to.format('MMM D, YYYY')}`;
};

export const slowZoneCard = (
  run: TripSlowZoneRun,
  color: string,
  pinned: boolean
): ResolvedHoverCardContent => {
  const hidden = run.zones.length - MAX_CARD_ZONES;
  return {
    title: formatRunDates(run),
    hero: {
      value: `+${getFormattedTimeString(run.total)}`,
      caption: `Added by ${zoneCount(run)}`,
      color,
    },
    rows: run.zones.slice(0, MAX_CARD_ZONES).map((zone) => ({
      label: zone.title,
      value: `+${getFormattedTimeString(zone.delay)}`,
      color: hexWithAlpha(color, 0.6),
    })),
    notes: [
      ...(hidden > 0 ? [`And ${hidden} more`] : []),
      pinned ? 'Click to remove the shading' : 'Click to shade slow zones on the chart',
    ],
  };
};

/** Shading for every run, darker the more time it added. */
export const getSlowZoneAnnotations = (
  runs: PlacedSlowZoneRun[],
  color: string
): AnnotationOptions<'box'>[] => {
  const max = Math.max(...runs.map((run) => run.total), 1);
  return runs.map((run) => ({
    type: 'box',
    xMin: run.from,
    xMax: run.to,
    backgroundColor: hexWithAlpha(
      color,
      MIN_SHADING_ALPHA + (MAX_SHADING_ALPHA - MIN_SHADING_ALPHA) * (run.total / max)
    ),
    borderWidth: 0,
    drawTime: 'beforeDatasetsDraw',
  }));
};
