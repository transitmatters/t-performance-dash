import { METRICS } from '../config';
import type { Fact, FactKind, Row } from '../types';
import { trendSentiment } from './series';
import { gapToGood, isMeasured } from './status';

const PER_KIND = 3;
const MAX_PER_ROW = 1;
const MAX_PER_METRIC = 2;
/** A 2-week move this big is news even when the status hasn't changed. */
const BIG_TREND = 0.1;
// Commuter Rail and bus fall furthest short of what riders need, so their issues surface first.
const ISSUE_WEIGHT: Record<string, number> = {
  'commuter-rail': 1.25,
  'frequent-bus': 1.25,
  'all-bus': 1.25,
};

const candidatesFor = (row: Row): Fact[] =>
  Object.values(row.cells).flatMap((cell): Fact[] => {
    if (!isMeasured(cell.status)) return [];
    const method = METRICS[cell.metric];
    const facts: Fact[] = [];
    if (cell.status === 'win') {
      const margin = cell.score !== null ? Math.abs(cell.score / method.thresholds[0] - 1) : 0;
      facts.push({
        kind: 'win',
        rowId: row.id,
        metric: cell.metric,
        key: 'status',
        score: 2 + margin,
      });
    }
    if (cell.status === 'problem') {
      facts.push({
        kind: 'issue',
        rowId: row.id,
        metric: cell.metric,
        key: 'status',
        score: (3 + gapToGood(cell, method)) * (ISSUE_WEIGHT[row.id] ?? 1),
      });
    }
    if (cell.trend !== null && !cell.trendBasis && Math.abs(cell.trend) >= BIG_TREND) {
      const kind: FactKind =
        trendSentiment(cell.trend, method.direction) === 'good' ? 'win' : 'issue';
      // Improving on a cell that's already a win (say, slow zones going from 20 seconds to none)
      // isn't news, and near-zero values make for huge percentages.
      if (kind === 'win' && cell.status === 'win') return facts;
      facts.push({
        kind,
        rowId: row.id,
        metric: cell.metric,
        key: 'trend',
        score:
          Math.min(Math.abs(cell.trend), 0.5) *
          10 *
          (kind === 'issue' ? (ISSUE_WEIGHT[row.id] ?? 1) : 1),
      });
    }
    return facts;
  });

const pick = (facts: Fact[]) => {
  const chosen: Fact[] = [];
  const byRow: Record<string, number> = {};
  const byMetric: Record<string, number> = {};
  const sorted = [...facts].sort(
    (a, b) =>
      b.score - a.score ||
      a.rowId.localeCompare(b.rowId) ||
      a.metric.localeCompare(b.metric) ||
      a.key.localeCompare(b.key)
  );
  for (const fact of sorted) {
    if (chosen.length === PER_KIND) break;
    if ((byRow[fact.rowId] ?? 0) >= MAX_PER_ROW) continue;
    if ((byMetric[fact.metric] ?? 0) >= MAX_PER_METRIC) continue;
    chosen.push(fact);
    byRow[fact.rowId] = (byRow[fact.rowId] ?? 0) + 1;
    byMetric[fact.metric] = (byMetric[fact.metric] ?? 0) + 1;
  }
  return chosen;
};

/** Top wins and issues, at most one per row and two per metric so one story can't crowd out the rest. */
export const buildFacts = (rows: Row[]) => {
  const all = rows.flatMap(candidatesFor);
  return {
    wins: pick(all.filter((f) => f.kind === 'win')),
    issues: pick(all.filter((f) => f.kind === 'issue')),
  };
};
