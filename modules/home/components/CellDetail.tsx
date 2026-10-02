import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CR_ELECTRIFIED_THRESHOLDS, METRICS } from '../config';
import { STATUS_LABELS } from '../copy';
import { formatCell, formatThresholds, formatTrend, STATUS_TONE } from '../format';
import { trendSentiment } from '../compute/series';
import { cn } from '../../../common/utils/cn';
import type { Cell, Row } from '../types';
import { StatusNode } from './StatusNode';

interface CellDetailProps {
  row: Row;
  cell: Cell;
}

/** Everything behind one stop: the number, what it's judged against, and how the status is set. */
export const CellDetail: React.FC<CellDetailProps> = ({ row, cell }) => {
  const method = METRICS[cell.metric];
  const trend = formatTrend(cell);
  const sentiment = trendSentiment(cell.trend, method.direction);
  const thresholds =
    row.id === 'commuter-rail' && cell.metric === 'fleet'
      ? formatThresholds(method, CR_ELECTRIFIED_THRESHOLDS, 'higher', 'pct')
      : formatThresholds(method);

  return (
    <div className="flex flex-col gap-2" data-line={row.line}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">
          {row.label} · {method.label}
        </span>
        <span
          className={cn('flex items-center gap-1.5 text-xs font-medium', STATUS_TONE[cell.status])}
        >
          <span className="text-primary">
            <StatusNode status={cell.status} className="size-4" />
          </span>
          {STATUS_LABELS[cell.status]}
        </span>
      </div>
      {cell.status !== 'na' && (
        <div className="text-2xl font-semibold tabular-nums">{formatCell(cell, true)}</div>
      )}
      <div className="text-muted-foreground flex flex-col gap-0.5 text-xs">
        {cell.secondary && <p>{cell.secondary}</p>}
        {cell.baselineLabel && <p>{cell.baselineLabel}</p>}
        {trend && (
          <p
            className={cn(
              sentiment === 'good' && 'text-green-700 dark:text-green-400',
              sentiment === 'bad' && 'text-destructive'
            )}
          >
            {trend}
          </p>
        )}
      </div>
      {cell.notes?.map((note) => (
        <p key={note} className="text-xs">
          {note}
        </p>
      ))}
      <p className="text-muted-foreground border-t pt-2 text-xs">{method.definition}</p>
      {cell.status !== 'na' && <p className="text-muted-foreground text-xs">{thresholds}</p>}
      {cell.href && (
        <Link
          href={cell.href}
          className="text-primary inline-flex items-center gap-1 text-xs font-medium hover:underline"
        >
          See the details <ArrowRight className="size-3" aria-hidden />
        </Link>
      )}
    </div>
  );
};
