import type { CSSProperties, ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { InfoTooltip } from '../../../common/components/general/InfoTooltip';
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
import { formatCell, HEADLINE_TONE, STATUS_NODE_TONE } from '../format';
import type { Cell, MetricId, Row } from '../types';
import type { HomeState } from '../useHomeData';
import { CellDetail } from './CellDetail';
import { Placeholder } from './Placeholder';
import { StatusLegend } from './StatusLegend';
import { StatusNode } from './StatusNode';

type Layout = 'column' | 'grid';

const HeadlineBadge = ({ row }: { row: Row }) => (
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

/** A line with too little data to judge gets one sentence instead of a strip of empty stops. */
const isLimited = (line: ScoreboardLine) => line.row?.headline.kind === 'limited';

const RowTitle = ({ line: { config, row }, state }: { line: ScoreboardLine; state: HomeState }) => {
  const heldBack =
    row && row.headline.kind !== 'limited' ? heldBackLabel(row.headline.heldBackBy) : undefined;
  return (
    <div className="flex min-w-0 flex-col gap-1">
      {/* Fixed heights, so the row doesn't grow when its verdict arrives. */}
      <div className="flex min-h-[22px] flex-wrap items-center gap-x-2 gap-y-1">
        <Link href={config.href} className="flex items-center gap-2 font-semibold hover:underline">
          <span className="text-primary">
            <RouteBullet />
          </span>
          {config.label}
        </Link>
        {row ? (
          <HeadlineBadge row={row} />
        ) : (
          <Placeholder className="h-[22px] w-20" pulse={state === 'loading'} />
        )}
      </div>
      {!isLimited({ config, row }) && (
        <span className="min-h-4 text-xs text-muted-foreground">
          {row ? (
            heldBack && <span className="tm-fade-in">{heldBack}</span>
          ) : (
            <Placeholder className="h-3 w-28" pulse={state === 'loading'} />
          )}
        </span>
      )}
    </div>
  );
};

const cellLabel = (row: Row, cell: Cell) =>
  `${row.label} ${METRICS[cell.metric].label}: ${STATUS_LABELS[cell.status]}${
    cell.status === 'na' ? '' : `, ${formatCell(cell, true)}`
  }. Show details.`;

const stopClass = (layout: Layout) =>
  layout === 'column'
    ? 'flex w-full justify-center py-1'
    : 'flex w-full items-center gap-2 py-1.5 text-left text-xs';

/** The metric's name beside the stop, on the narrow layout where there's no column header. */
const StopLabel = ({ metric, muted }: { metric: MetricId; muted?: boolean }) => (
  <span className={cn('min-w-0 truncate font-medium', muted && 'text-muted-foreground')}>
    {METRICS[metric].label}
  </span>
);

/**
 * One stop on the strip. The overview shows only its status; the figure, trend and cut-offs are
 * one tap away. A measure that isn't taken for the line is an unlit, unfocusable gap.
 */
const Stop = ({ row, cell, layout }: { row: Row; cell: Cell; layout: Layout }) => {
  if (cell.status === 'na') {
    return (
      <span className={cn('tm-fade-in', stopClass(layout))}>
        {/* On the strip the track simply runs on past it; the narrow layout names it. */}
        {layout === 'column' ? (
          <span aria-hidden="true" className="size-6" />
        ) : (
          <>
            <span className="flex w-5 justify-center">
              <StatusNode status="na" />
            </span>
            <StopLabel metric={cell.metric} muted />
          </>
        )}
        <span className="sr-only">
          {METRICS[cell.metric].label}: {STATUS_LABELS.na}
        </span>
      </span>
    );
  }
  return (
    <Popover>
      <PopoverTrigger
        aria-label={cellLabel(row, cell)}
        className={cn(
          'group tm-fade-in rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring',
          stopClass(layout)
        )}
      >
        <span
          className={cn(
            'relative z-10 flex transition-transform group-hover:scale-110',
            STATUS_NODE_TONE[cell.status]
          )}
        >
          <StatusNode status={cell.status} className={layout === 'column' ? 'size-6' : undefined} />
        </span>
        {layout === 'grid' && <StopLabel metric={cell.metric} />}
      </PopoverTrigger>
      <PopoverContent className="w-80" align="center">
        <CellDetail row={row} cell={cell} />
      </PopoverContent>
    </Popover>
  );
};

/** Holds a stop's place until its data lands, laid out like `Stop` so nothing moves. */
const PendingStop = ({
  metric,
  layout,
  state,
}: {
  metric: MetricId;
  layout: Layout;
  state: HomeState;
}) => (
  <span className={stopClass(layout)}>
    <span className="relative z-10 flex text-primary">
      <span
        aria-hidden="true"
        className={cn(
          'inline-block rounded-full border-2 border-current bg-card opacity-40',
          layout === 'column' ? 'size-6' : 'size-5',
          state === 'loading' && 'animate-pulse motion-reduce:animate-none'
        )}
      />
    </span>
    {layout === 'grid' && <StopLabel metric={metric} muted />}
  </span>
);

/** Stands in for a cell the published file doesn't have yet. */
const missingCell = (metric: MetricId): Cell => ({
  metric,
  status: 'na',
  score: null,
  value: null,
  unit: 'pct',
  trend: null,
});

const LineStop = ({
  line: { row },
  metric,
  layout,
  state,
}: {
  line: ScoreboardLine;
  metric: MetricId;
  layout: Layout;
  state: HomeState;
}) =>
  row ? (
    <Stop row={row} cell={row.cells[metric] ?? missingCell(metric)} layout={layout} />
  ) : (
    <PendingStop metric={metric} layout={layout} state={state} />
  );

/** What a line with too little data shows in place of its stops. */
const LimitedNote = ({ line: { config, row } }: { line: ScoreboardLine }) => {
  const href = row?.cells.service?.href ?? config.href;
  return (
    <p className="tm-fade-in text-sm text-muted-foreground">
      Not enough data to judge yet.{' '}
      <Link
        href={href}
        className="inline-flex items-center gap-1 font-medium text-foreground underline-offset-4 hover:underline"
      >
        See what we have <ArrowRight className="size-3" aria-hidden />
      </Link>
    </p>
  );
};

const GroupHeading = ({ children }: { children: ReactNode }) => (
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

const DesktopTable = ({ lines, state }: { lines: ScoreboardLine[]; state: HomeState }) => {
  const renderRow = (line: ScoreboardLine, index: number) => (
    <tr
      key={line.config.id}
      data-line={line.config.line}
      className="tm-reveal border-b last:border-0"
      style={{ '--reveal-index': index } as CSSProperties}
    >
      <th scope="row" className="w-64 py-3 pr-2 pl-6 text-left align-middle font-normal">
        <RowTitle line={line} state={state} />
      </th>
      {isLimited(line) ? (
        <td colSpan={METRIC_ORDER.length} className="px-4 py-3 align-middle">
          <LimitedNote line={line} />
        </td>
      ) : (
        METRIC_ORDER.map((metric, i) => (
          <td key={metric} className="relative px-1 py-3 align-middle">
            {/* The line runs through its stops; it starts and ends at the first and last one. */}
            <span
              className={cn(
                'pointer-events-none absolute top-1/2 -translate-y-1/2 text-primary opacity-40',
                i === 0 ? 'left-1/2' : 'left-0',
                i === METRIC_ORDER.length - 1 ? 'right-1/2' : 'right-0'
              )}
            >
              <RouteLine />
            </span>
            <LineStop line={line} metric={metric} layout="column" state={state} />
          </td>
        ))
      )}
    </tr>
  );

  const core = lines.filter((l) => l.config.group === 'core');
  const also = lines.filter((l) => l.config.group === 'also');
  return (
    <table className="hidden w-full table-fixed text-sm lg:table">
      <thead>
        <tr className="border-b">
          <th scope="col" className="w-64 pb-2 pl-6 text-left">
            <span className="sr-only">Line</span>
          </th>
          {METRIC_ORDER.map((metric) => (
            <th scope="col" key={metric} className="pb-2 text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                {METRICS[metric].label}
                <InfoTooltip info={METRICS[metric].summary} className="leading-none" />
              </span>
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

const MobileStrips = ({ lines, state }: { lines: ScoreboardLine[]; state: HomeState }) => (
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
        style={{ '--reveal-index': index } as CSSProperties}
      >
        <RowTitle line={line} state={state} />
        {isLimited(line) ? (
          <div className="mt-2">
            <LimitedNote line={line} />
          </div>
        ) : (
          <ul className="mt-2 grid grid-cols-2 gap-x-3 min-[380px]:grid-cols-3">
            {METRIC_ORDER.map((metric) => (
              <li key={metric} className="min-w-0">
                <LineStop line={line} metric={metric} layout="grid" state={state} />
              </li>
            ))}
          </ul>
        )}
      </li>,
    ])}
  </ul>
);

export const Scoreboard = ({
  rows,
  state,
  onRetry,
}: {
  rows?: Row[];
  state: HomeState;
  onRetry: () => void;
}) => {
  const lines = ROWS.map((config) => ({ config, row: rows?.find((r) => r.id === config.id) }));
  return (
    <Card aria-busy={state === 'loading'}>
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-1.5">
          <CardTitle>Line by line</CardTitle>
          <CardDescription>
            Each line is only as good as its weakest measure: there's no averaging. Tap any stop for
            the numbers behind it.
          </CardDescription>
        </div>
        <StatusLegend />
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
