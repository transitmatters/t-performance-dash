import React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../common/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '../../../common/components/ui/popover';
import { RouteBullet } from '../../../common/components/transit/RouteBullet';
import { RouteLine } from '../../../common/components/transit/RouteLine';
import { cn } from '../../../common/utils/cn';
import { METRICS, METRIC_ORDER } from '../config';
import { HEADLINE_LABELS, STATUS_LABELS, heldBackLabel } from '../copy';
import { formatCell, STATUS_TONE } from '../format';
import type { Cell, HeadlineKind, Row } from '../types';
import { CellDetail } from './CellDetail';
import { StatusNode } from './StatusNode';

const HEADLINE_TONE: Record<HeadlineKind, string> = {
  strong: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  good: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  room: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  needsWork: 'bg-destructive/10 text-destructive dark:bg-destructive/20',
  limited: 'border-border text-muted-foreground border',
};

const HeadlineBadge: React.FC<{ row: Row }> = ({ row }) => (
  <span
    className={cn(
      'inline-flex w-fit items-center rounded-md px-1.5 py-0.5 text-xs font-medium whitespace-nowrap',
      HEADLINE_TONE[row.headline.kind]
    )}
  >
    {HEADLINE_LABELS[row.headline.kind]}
  </span>
);

const RowTitle: React.FC<{ row: Row }> = ({ row }) => {
  const heldBack =
    row.headline.kind === 'limited' ? undefined : heldBackLabel(row.headline.heldBackBy);
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Link href={row.href} className="flex items-center gap-2 font-semibold hover:underline">
        <span className="text-primary">
          <RouteBullet />
        </span>
        {row.label}
      </Link>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <HeadlineBadge row={row} />
        {heldBack && <span className="text-muted-foreground text-xs">{heldBack}</span>}
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
        'group focus-visible:ring-ring flex rounded-md outline-none focus-visible:ring-2',
        layout === 'column'
          ? 'w-full flex-col items-center gap-1.5 px-1 py-0.5 text-center'
          : 'w-full items-center gap-3 py-2 text-left'
      )}
    >
      <span
        className={cn(
          'text-primary relative z-10 flex transition-transform group-hover:scale-110',
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
            cell.status === 'na' && 'text-muted-foreground font-normal'
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

const GroupHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tr>
    <th
      colSpan={METRIC_ORDER.length + 1}
      scope="colgroup"
      className="text-muted-foreground px-6 pt-5 pb-1 text-left text-xs font-medium tracking-wide uppercase"
    >
      {children}
    </th>
  </tr>
);

const DesktopTable: React.FC<{ rows: Row[] }> = ({ rows }) => {
  const renderRow = (row: Row, index: number) => (
    <tr
      key={row.id}
      data-line={row.line}
      className="tm-reveal border-b last:border-0"
      style={{ '--reveal-index': index } as React.CSSProperties}
    >
      <th scope="row" className="w-56 py-3 pr-2 pl-6 text-left align-top font-normal">
        <RowTitle row={row} />
      </th>
      {METRIC_ORDER.map((metric, i) => (
        <td key={metric} className="relative px-1 py-3 align-top">
          {/* The line runs through its stops; it starts and ends at the first and last one. */}
          <span
            className={cn(
              'text-primary pointer-events-none absolute top-[22px] opacity-40',
              i === 0 ? 'left-1/2' : 'left-0',
              i === METRIC_ORDER.length - 1 ? 'right-1/2' : 'right-0'
            )}
          >
            <RouteLine />
          </span>
          <Stop row={row} cell={row.cells[metric]} layout="column" />
        </td>
      ))}
    </tr>
  );

  const core = rows.filter((r) => r.group === 'core');
  const also = rows.filter((r) => r.group === 'also');
  return (
    <table className="hidden w-full table-fixed text-sm lg:table">
      <thead>
        <tr className="border-b">
          <th scope="col" className="w-56 pb-2 pl-6 text-left">
            <span className="sr-only">Line</span>
          </th>
          {METRIC_ORDER.map((metric) => (
            <th scope="col" key={metric} className="text-muted-foreground pb-2 text-xs font-medium">
              {METRICS[metric].label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {core.map(renderRow)}
        {also.length > 0 && <GroupHeading>Also running</GroupHeading>}
        {also.map((row, i) => renderRow(row, core.length + i))}
      </tbody>
    </table>
  );
};

const MobileStrips: React.FC<{ rows: Row[] }> = ({ rows }) => (
  <ul className="flex flex-col gap-3 lg:hidden">
    {rows.flatMap((row, index) => [
      ...(index > 0 && row.group === 'also' && rows[index - 1].group === 'core'
        ? [
            <li
              key="also-running"
              className="text-muted-foreground px-1 pt-2 text-xs font-medium tracking-wide uppercase"
            >
              Also running
            </li>,
          ]
        : []),
      <li
        key={row.id}
        data-line={row.line}
        className="tm-reveal bg-card rounded-xl border px-4 py-3"
        style={{ '--reveal-index': index } as React.CSSProperties}
      >
        <RowTitle row={row} />
        <div className="relative mt-2">
          <span className="text-primary pointer-events-none absolute top-5 bottom-5 left-2.5 -translate-x-1/2 opacity-40">
            <RouteLine orientation="vertical" />
          </span>
          <ul>
            {METRIC_ORDER.map((metric) => (
              <li key={metric}>
                <Stop row={row} cell={row.cells[metric]} layout="row" />
              </li>
            ))}
          </ul>
        </div>
      </li>,
    ])}
  </ul>
);

export const Scoreboard: React.FC<{ rows: Row[] }> = ({ rows }) => (
  <Card>
    <CardHeader>
      <CardTitle>Every line, every measure</CardTitle>
      <CardDescription>
        Each line is only as good as its weakest measure: there's no averaging. Tap any stop for the
        numbers behind it.
      </CardDescription>
    </CardHeader>
    <CardContent className="px-3 lg:px-0">
      <DesktopTable rows={rows} />
      <MobileStrips rows={rows} />
    </CardContent>
  </Card>
);
