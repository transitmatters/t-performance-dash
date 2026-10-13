import React from 'react';
import { Link } from '../../../common/components/general/Link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../common/components/ui/card';
import { Button } from '../../../common/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../../../common/components/ui/popover';
import { RouteBullet } from '../../../common/components/transit/RouteBullet';
import { RouteLine } from '../../../common/components/transit/RouteLine';
import { cn } from '../../../common/utils/cn';
import { METRICS, METRIC_ORDER, ROWS } from '../config';
import type { RowConfig } from '../config';
import { HEADLINE_LABELS, STATUS_LABELS, heldBackLabel } from '../copy';
import { formatCell, STATUS_TONE } from '../format';
import type { Cell, HeadlineKind, MetricId, Row } from '../types';
import type { HomeState } from '../useHomeData';
import { CellDetail } from './CellDetail';
import { Placeholder } from './Placeholder';
import { StatusNode } from './StatusNode';

const HEADLINE_TONE: Record<HeadlineKind, string> = {
  strong: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  good: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  room: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  needsWork: 'bg-destructive/10 text-destructive dark:bg-destructive/20',
  limited: 'border-border text-muted-foreground',
};

const HeadlineBadge: React.FC<{ row: Row }> = ({ row }) => (
  <span
    className={cn(
      'tm-fade-in inline-flex w-fit items-center rounded-md border border-transparent px-1.5 py-0.5 text-xs font-medium whitespace-nowrap',
      HEADLINE_TONE[row.headline.kind]
    )}
  >
    {HEADLINE_LABELS[row.headline.kind]}
  </span>
);

/** A line in the scoreboard: its config is always there, its built row once the data is in. */
interface ScoreboardLine {
  config: RowConfig;
  row?: Row;
}

const RowTitle: React.FC<{ line: ScoreboardLine; state: HomeState }> = ({
  line: { config, row },
  state,
}) => {
  const heldBack =
    row && row.headline.kind !== 'limited' ? heldBackLabel(row.headline.heldBackBy) : undefined;
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Link href={config.href} className="flex items-center gap-2 font-semibold hover:underline">
        <span className="text-primary">
          <RouteBullet />
        </span>
        {config.label}
      </Link>
      {/* Fixed heights, so the row doesn't grow when its verdict arrives: room for the held-back
          line to wrap once in the narrow desktop column, never on the wider mobile card. */}
      <div className="flex flex-col items-start gap-1">
        {row ? (
          <HeadlineBadge row={row} />
        ) : (
          <Placeholder className="h-[22px] w-20" pulse={state === 'loading'} />
        )}
        <span className="min-h-4 text-xs text-muted-foreground lg:min-h-8">
          {row ? (
            heldBack && <span className="tm-fade-in">{heldBack}</span>
          ) : (
            <Placeholder className="h-3 w-28" pulse={state === 'loading'} />
          )}
        </span>
      </div>
    </div>
  );
};

const cellLabel = (row: Row, cell: Cell) =>
  `${row.label} ${METRICS[cell.metric].label}: ${STATUS_LABELS[cell.status]}${
    cell.status === 'na' ? '' : `, ${formatCell(cell, true)}`
  }. Show details.`;

/** One stop on the strip: the node opens the detail, with the figure and its status beneath. */
const Stop: React.FC<{ row: Row; cell: Cell; layout: 'column' | 'row' }> = ({
  row,
  cell,
  layout,
}) => (
  <Popover>
    <PopoverTrigger
      aria-label={cellLabel(row, cell)}
      className={cn(
        'group tm-fade-in flex rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring',
        layout === 'column'
          ? 'w-full flex-col items-center gap-1.5 px-1 py-0.5 text-center'
          : 'w-full items-center gap-3 py-2 text-left'
      )}
    >
      <span
        className={cn(
          'relative z-10 flex text-primary transition-transform group-hover:scale-110',
          layout === 'row' && 'w-5 justify-center'
        )}
      >
        <StatusNode status={cell.status} />
      </span>
      {layout === 'row' && (
        <span className="flex-1 text-sm font-medium">{METRICS[cell.metric].label}</span>
      )}
      <span className={cn('flex flex-col', layout === 'row' ? 'items-end' : 'items-center')}>
        <span
          className={cn(
            'text-sm font-semibold tabular-nums',
            cell.status === 'na' && 'font-normal text-muted-foreground'
          )}
        >
          {formatCell(cell)}
        </span>
        <span className={cn('text-[11px] leading-tight', STATUS_TONE[cell.status])}>
          {STATUS_LABELS[cell.status]}
        </span>
      </span>
    </PopoverTrigger>
    <PopoverContent className="w-80" align="center">
      <CellDetail row={row} cell={cell} />
    </PopoverContent>
  </Popover>
);

/**
 * Holds a stop's place until its data lands: an unlit stop on the line, with bars where the figure
 * and status go, laid out like `Stop` so nothing moves when it fills in.
 */
const PendingStop: React.FC<{ metric: MetricId; layout: 'column' | 'row'; state: HomeState }> = ({
  metric,
  layout,
  state,
}) => {
  const pulse = state === 'loading';
  return (
    <span
      className={cn(
        'flex',
        layout === 'column'
          ? 'w-full flex-col items-center gap-1.5 px-1 py-0.5'
          : 'w-full items-center gap-3 py-2'
      )}
    >
      <span
        className={cn('relative z-10 flex text-primary', layout === 'row' && 'w-5 justify-center')}
      >
        <span
          aria-hidden="true"
          className={cn(
            'inline-block size-5 rounded-full border-2 border-current bg-card opacity-40',
            pulse && 'animate-pulse motion-reduce:animate-none'
          )}
        />
      </span>
      {layout === 'row' && (
        <span className="flex-1 text-sm font-medium">{METRICS[metric].label}</span>
      )}
      <span className={cn('flex flex-col', layout === 'row' ? 'items-end' : 'items-center')}>
        <span className="text-sm font-semibold text-muted-foreground">
          {state === 'error' ? '—' : <Placeholder className="h-3.5 w-12" />}
        </span>
        <span className="text-[11px] leading-tight">
          <Placeholder className="h-2 w-10" pulse={pulse} />
        </span>
      </span>
    </span>
  );
};

const LineStop: React.FC<{
  line: ScoreboardLine;
  metric: MetricId;
  layout: 'column' | 'row';
  state: HomeState;
}> = ({ line: { row }, metric, layout, state }) =>
  row ? (
    <Stop row={row} cell={row.cells[metric]} layout={layout} />
  ) : (
    <PendingStop metric={metric} layout={layout} state={state} />
  );

const GroupHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tr>
    <th
      colSpan={METRIC_ORDER.length + 1}
      scope="colgroup"
      className="px-6 pt-5 pb-1 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase"
    >
      {children}
    </th>
  </tr>
);

const DesktopTable: React.FC<{ lines: ScoreboardLine[]; state: HomeState }> = ({
  lines,
  state,
}) => {
  const renderRow = (line: ScoreboardLine, index: number) => (
    <tr
      key={line.config.id}
      data-line={line.config.line}
      className="tm-reveal border-b last:border-0"
      style={{ '--reveal-index': index } as React.CSSProperties}
    >
      <th scope="row" className="w-56 py-3 pr-2 pl-6 text-left align-top font-normal">
        <RowTitle line={line} state={state} />
      </th>
      {METRIC_ORDER.map((metric, i) => (
        <td key={metric} className="relative px-1 py-3 align-top">
          {/* The line runs through its stops; it starts and ends at the first and last one. */}
          <span
            className={cn(
              'pointer-events-none absolute top-[22px] text-primary opacity-40',
              i === 0 ? 'left-1/2' : 'left-0',
              i === METRIC_ORDER.length - 1 ? 'right-1/2' : 'right-0'
            )}
          >
            <RouteLine />
          </span>
          <LineStop line={line} metric={metric} layout="column" state={state} />
        </td>
      ))}
    </tr>
  );

  const core = lines.filter((l) => l.config.group === 'core');
  const also = lines.filter((l) => l.config.group === 'also');
  return (
    <table className="hidden w-full table-fixed text-sm lg:table">
      <thead>
        <tr className="border-b">
          <th scope="col" className="w-56 pb-2 pl-6 text-left">
            <span className="sr-only">Line</span>
          </th>
          {METRIC_ORDER.map((metric) => (
            <th scope="col" key={metric} className="pb-2 text-xs font-medium text-muted-foreground">
              {METRICS[metric].label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {core.map(renderRow)}
        {also.length > 0 && <GroupHeading>Also running</GroupHeading>}
        {also.map((line, i) => renderRow(line, core.length + i))}
      </tbody>
    </table>
  );
};

const MobileStrips: React.FC<{ lines: ScoreboardLine[]; state: HomeState }> = ({
  lines,
  state,
}) => (
  <ul className="flex flex-col gap-3 lg:hidden">
    {lines.flatMap((line, index) => [
      ...(index > 0 && line.config.group === 'also' && lines[index - 1].config.group === 'core'
        ? [
            <li
              key="also-running"
              className="px-1 pt-2 text-xs font-medium tracking-wide text-muted-foreground uppercase"
            >
              Also running
            </li>,
          ]
        : []),
      <li
        key={line.config.id}
        data-line={line.config.line}
        className="tm-reveal rounded-xl border bg-card px-4 py-3"
        style={{ '--reveal-index': index } as React.CSSProperties}
      >
        <RowTitle line={line} state={state} />
        <div className="relative mt-2">
          <span className="pointer-events-none absolute top-5 bottom-5 left-2.5 -translate-x-1/2 text-primary opacity-40">
            <RouteLine orientation="vertical" />
          </span>
          <ul>
            {METRIC_ORDER.map((metric) => (
              <li key={metric}>
                <LineStop line={line} metric={metric} layout="row" state={state} />
              </li>
            ))}
          </ul>
        </div>
      </li>,
    ])}
  </ul>
);

export const Scoreboard: React.FC<{ rows?: Row[]; state: HomeState; onRetry: () => void }> = ({
  rows,
  state,
  onRetry,
}) => {
  const lines = ROWS.map((config) => ({ config, row: rows?.find((r) => r.id === config.id) }));
  return (
    <Card aria-busy={state === 'loading'}>
      <CardHeader>
        <CardTitle>Every line, every measure</CardTitle>
        <CardDescription>
          Each line is only as good as its weakest measure: there's no averaging. Tap any stop for
          the numbers behind it.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 lg:px-0">
        {state === 'loading' && <p className="sr-only">Loading the latest numbers.</p>}
        {state === 'error' && (
          <div
            role="alert"
            className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm lg:mx-6"
          >
            <span>
              Couldn't load the latest numbers. Each line's own pages are still up to date.
            </span>
            <Button variant="outline" size="sm" onClick={onRetry}>
              Try again
            </Button>
          </div>
        )}
        <DesktopTable lines={lines} state={state} />
        <MobileStrips lines={lines} state={state} />
      </CardContent>
    </Card>
  );
};
