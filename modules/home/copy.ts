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

export const heldBackLabel = (metrics: MetricId[]) =>
  metrics.length
    ? `Held back by ${metrics
        .slice(0, 2)
        .map((m) => METRICS[m].label.toLowerCase())
        .join(' and ')}`
    : undefined;
