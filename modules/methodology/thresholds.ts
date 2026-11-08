import type { Cell, CellPart, Direction, HomeData, MetricId, Unit } from '../home/types';

export interface ThresholdGroup {
  /** The measure behind a combined cell, e.g. "Slow zones"; undefined for the cell itself. */
  part?: string;
  thresholds: [number, number, number];
  direction: Direction;
  scoreUnit: Unit;
  /** Rows judged this way, in scoreboard order. */
  rows: string[];
}

type Judged = Pick<Cell | CellPart, 'thresholds' | 'direction' | 'scoreUnit'>;

const isJudged = (
  cell: Judged
): cell is Required<Pick<Judged, 'thresholds' | 'direction' | 'scoreUnit'>> =>
  !!cell.thresholds && !!cell.direction && !!cell.scoreUnit;

/**
 * Every way a measure is judged in the published scoreboard, with the rows judged each way. Most
 * measures have one; Reliability has another for Commuter Rail, and Speed lists its parts.
 */
export const thresholdGroups = (data: HomeData | undefined, metric: MetricId): ThresholdGroup[] => {
  const groups: ThresholdGroup[] = [];
  const add = (judged: Judged, row: string, part?: string) => {
    if (!isJudged(judged)) return;
    const match = groups.find(
      (g) =>
        g.part === part &&
        g.direction === judged.direction &&
        g.scoreUnit === judged.scoreUnit &&
        g.thresholds.every((t, i) => t === judged.thresholds[i])
    );
    if (match) {
      if (!match.rows.includes(row)) match.rows.push(row);
    } else {
      groups.push({
        part,
        thresholds: judged.thresholds,
        direction: judged.direction,
        scoreUnit: judged.scoreUnit,
        rows: [row],
      });
    }
  };
  for (const row of data?.rows ?? []) {
    const cell = row.cells[metric];
    if (!cell || cell.status === 'na') continue;
    if (cell.parts?.length) cell.parts.forEach((part) => add(part, row.label, part.label));
    else add(cell, row.label);
  }
  return groups;
};
