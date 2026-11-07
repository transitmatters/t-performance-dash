import { METRICS } from './config';
import type { HeadlineKind, MetricId, Status } from './types';

export const STATUS_LABELS: Record<Status, string> = {
  win: 'Win',
  good: 'Good',
  room: 'Room to grow',
  problem: 'Needs work',
  insufficient: 'Not enough data',
  na: 'Not measured',
};

export const HEADLINE_LABELS: Record<HeadlineKind, string> = {
  strong: 'Strong',
  good: 'Good',
  room: 'Room to grow',
  needsWork: 'Needs work',
  limited: 'Limited data',
};

export const heldBackLabel = (metrics: MetricId[]) => {
  // Skips measures the page no longer shows, which older data can still list.
  const labels = metrics.filter((m) => m in METRICS).map((m) => METRICS[m].label.toLowerCase());
  return labels.length ? `Held back by ${labels.slice(0, 2).join(' and ')}` : undefined;
};
