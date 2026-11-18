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

const isMetric = (metric: string): metric is MetricId => metric in METRICS;

export const heldBackLabel = (metrics: string[]) => {
  // Skips measures the page no longer shows, which older data can still list.
  const labels = metrics.filter(isMetric).map((m) => METRICS[m].label.toLowerCase());
  return labels.length ? `Held back by ${labels.slice(0, 2).join(' and ')}` : undefined;
};
