import { formatList } from '../../common/i18n/format';
import { i18n } from '../../common/i18n';
import { METRICS } from './config';
import type { HeadlineKind, MetricId, Status } from './types';

export const STATUS_LABELS: Record<Status, string> = {
  win: i18n.t('home:status.win'),
  good: i18n.t('home:status.good'),
  room: i18n.t('home:status.room'),
  problem: i18n.t('home:status.problem'),
  insufficient: i18n.t('home:status.insufficient'),
  na: i18n.t('home:status.na'),
};

export const HEADLINE_LABELS: Record<HeadlineKind, string> = {
  strong: i18n.t('home:headline.strong'),
  good: i18n.t('home:headline.good'),
  room: i18n.t('home:headline.room'),
  needsWork: i18n.t('home:headline.needsWork'),
  limited: i18n.t('home:headline.limited'),
};

export const heldBackLabel = (metrics: MetricId[]) =>
  metrics.length
    ? i18n.t('home:heldBackBy', {
        metrics: formatList(metrics.slice(0, 2).map((m) => METRICS[m].inSentence)),
      })
    : undefined;
