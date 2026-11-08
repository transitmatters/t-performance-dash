import { ArrowRight } from 'lucide-react';
import { Link } from '../../../common/components/general/Link';
import { METRICS, definitionFor } from '../config';
import { STATUS_LABELS } from '../copy';
import {
  formatCell,
  formatThresholds,
  formatTrend,
  formatValue,
  STATUS_TONE,
  trendSentiment,
} from '../format';
import { cn } from '../../../common/utils/cn';
import type { Cell, CellPart, Row } from '../types';
import { StatusNode } from './StatusNode';

interface CellDetailProps {
  row: Row;
  cell: Cell;
}

/** One measure behind a combined cell: its own figure, status, cut-offs and page. */
const PartDetail = ({ part }: { part: CellPart }) => {
  const thresholds = part.status !== 'na' ? formatThresholds(part) : undefined;
  return (
    <li className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-primary">
          <StatusNode status={part.status} className="size-3.5" />
        </span>
        <span className="font-medium">
          {part.href ? (
            <Link href={part.href} className="hover:underline">
              {part.label}
            </Link>
          ) : (
            part.label
          )}
        </span>
        <span className="tabular-nums">
          {formatValue(part.score, part.scoreUnit)}
          {part.unitLabel && part.score !== null && ` ${part.unitLabel}`}
        </span>
        <span className={cn('ml-auto font-medium', STATUS_TONE[part.status])}>
          {STATUS_LABELS[part.status]}
        </span>
      </div>
      {thresholds && <p className="pl-5 text-[11px] text-muted-foreground">{thresholds}</p>}
    </li>
  );
};

/** Everything behind one stop: the number, what it's judged against, and how the status is set. */
export const CellDetail = ({ row, cell }: CellDetailProps) => {
  const method = METRICS[cell.metric];
  const trend = formatTrend(cell);
  const definition = definitionFor(cell.metric, row.id);
  const sentiment = cell.direction ? trendSentiment(cell.trend, cell.direction) : 'flat';
  const thresholds = formatThresholds(cell);

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
      <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
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
      {cell.parts && cell.parts.length > 0 && (
        <ul className="flex flex-col gap-1.5 rounded-md border px-2 py-1.5">
          {cell.parts.map((part) => (
            <PartDetail key={part.label} part={part} />
          ))}
        </ul>
      )}
      {cell.notes?.map((note) => (
        <p key={note} className="text-xs">
          {note}
        </p>
      ))}
      {definition && (
        <p className="border-t pt-2 text-xs text-muted-foreground">
          {definition}{' '}
          <Link href={`/methodology#${cell.metric}`} className="underline hover:text-foreground">
            More on how we measure
          </Link>
        </p>
      )}
      {cell.status !== 'na' && !cell.parts?.length && thresholds && (
        <p className="text-xs text-muted-foreground">{thresholds}</p>
      )}
      {cell.href && (
        <Link
          href={cell.href}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          See the details <ArrowRight className="size-3" aria-hidden />
        </Link>
      )}
    </div>
  );
};
