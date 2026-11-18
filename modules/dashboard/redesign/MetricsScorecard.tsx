import classNames from 'classnames';
import { ChevronDown } from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../../common/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../../common/components/ui/table';
import { Badge } from '../../../common/components/ui/badge';
import { Button } from '../../../common/components/ui/button';
import { Skeleton } from '../../../common/components/ui/skeleton';
import { Sparkline } from '../../../common/components/charts/Sparkline';
import { RouteBullet } from '../../../common/components/transit/RouteBullet';
import { RouteLine } from '../../../common/components/transit/RouteLine';
import { StationNode } from '../../../common/components/transit/StationNode';
import { RollingNumber } from '../../../common/components/motion/RollingNumber';
import type { ScorecardRow, ScorecardSlot, MetricKey } from './types';

interface MetricsScorecardProps {
  slots: ScorecardSlot[];
  color?: string;
  selectedMetric: MetricKey;
  onSelectMetric: (metric: MetricKey) => void;
}

const badgeVariantFor = (sentiment: ScorecardRow['deltaSentiment']) => {
  if (sentiment === 'good') return 'success' as const;
  if (sentiment === 'bad') return 'destructive' as const;
  return 'outline' as const;
};

// Text colours to match the badge variants, for the secondary year-over-year line.
const textColorFor = (sentiment: ScorecardRow['deltaSentiment']) => {
  if (sentiment === 'good') return 'text-green-800 dark:text-green-300';
  if (sentiment === 'bad') return 'text-destructive';
  return 'text-muted-foreground';
};

const ReadyCells = ({ row }: { row: ScorecardRow }) => (
  <>
    <TableCell>
      <RollingNumber
        value={row.currentValue}
        format={row.formatValue}
        className="text-xl font-semibold tabular-nums"
      />{' '}
      <span className="text-xs text-muted-foreground">{row.unit}</span>
      {row.peakLabel && <div className="text-xs text-muted-foreground">{row.peakLabel}</div>}
    </TableCell>
    <TableCell>
      <Badge variant={badgeVariantFor(row.deltaSentiment)}>
        <span className="md:hidden">{row.deltaValueLabel}</span>
        <span className="hidden md:inline">{row.deltaLabel}</span>
      </Badge>
      {row.yearOverYear && (
        <div
          className={classNames(
            'mt-1 text-xs font-medium whitespace-nowrap',
            textColorFor(row.yearOverYear.sentiment)
          )}
        >
          <span className="md:hidden">{row.yearOverYear.shortLabel}</span>
          <span className="hidden md:inline">{row.yearOverYear.label}</span>
        </div>
      )}
    </TableCell>
    <TableCell className="hidden w-full pr-6 md:table-cell">
      <Sparkline values={row.trend} color={row.color} />
    </TableCell>
  </>
);

const LoadingCells = () => (
  <>
    <TableCell>
      <Skeleton className="h-6 w-16" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-5 w-12 md:w-20" />
    </TableCell>
    <TableCell className="hidden w-full pr-6 md:table-cell">
      <Skeleton className="h-4 w-full" />
    </TableCell>
  </>
);

/** A failed or empty row keeps its place, so it reads as missing rather than never there. */
const MissingCells = ({ slot }: { slot: ScorecardSlot }) => (
  <>
    <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
      {slot.status === 'error' ? "Couldn't load" : 'No recent data'}
    </TableCell>
    <TableCell>
      {slot.retry ? (
        <Button
          variant="outline"
          size="xs"
          disabled={slot.isRetrying}
          onClick={(event) => {
            // Retrying shouldn't also chart the row
            event.stopPropagation();
            slot.retry?.();
          }}
        >
          {slot.isRetrying ? (
            'Retrying…'
          ) : (
            <>
              <span className="md:hidden">Retry</span>
              <span className="hidden md:inline">Try again</span>
            </>
          )}
        </Button>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      )}
    </TableCell>
    <TableCell className="hidden w-full pr-6 md:table-cell" />
  </>
);

const SlotCells = ({ slot }: { slot: ScorecardSlot }) => {
  if (slot.status === 'ready' && slot.row) return <ReadyCells row={slot.row} />;
  if (slot.status === 'loading') return <LoadingCells />;
  return <MissingCells slot={slot} />;
};

/** Each row keeps its place while it loads, and fills in when its own data arrives. */
export const MetricsScorecard = ({
  slots,
  color,
  selectedMetric,
  onSelectMetric,
}: MetricsScorecardProps) => {
  const isLoading = slots.some((slot) => slot.status === 'loading');
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span style={{ color }}>
            <RouteBullet />
          </span>
          Metrics
        </CardTitle>
        <CardDescription>Select a row to chart it below.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Metric</TableHead>
              <TableHead>Latest 30 days</TableHead>
              <TableHead>
                <span className="md:hidden">Vs prev</span>
                <span className="hidden md:inline">Vs previous 30 days</span>
              </TableHead>
              <TableHead className="hidden pr-6 md:table-cell">12 months</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody
            role="radiogroup"
            aria-label="Select a metric to chart below"
            aria-busy={isLoading}
          >
            {slots.map((slot) => {
              const isSelected = slot.key === selectedMetric;
              const subtitle = slot.row?.subtitle ?? slot.subtitle;
              return (
                <TableRow
                  key={slot.key}
                  onClick={() => onSelectMetric(slot.key)}
                  className={classNames(
                    'hover:bg-muted/40 cursor-pointer transition-colors',
                    'has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset',
                    isSelected && 'bg-muted/60'
                  )}
                >
                  <TableCell className="relative pl-12" style={{ color }}>
                    <input
                      type="radio"
                      name="scorecard-metric"
                      className="sr-only"
                      checked={isSelected}
                      onChange={() => onSelectMetric(slot.key)}
                      aria-label={`Chart the ${slot.label} metric`}
                    />
                    <span className="pointer-events-none absolute inset-y-0 left-6 flex w-3 -translate-x-1/2 justify-center opacity-30">
                      <RouteLine orientation="vertical" />
                    </span>
                    <span className="pointer-events-none absolute top-1/2 left-6 flex w-3 -translate-x-1/2 -translate-y-1/2 justify-center">
                      <StationNode filled={isSelected} size={isSelected ? 'lg' : 'md'} />
                    </span>
                    <div className="flex flex-col gap-0.5 text-foreground">
                      <span className="text-sm font-medium">{slot.label}</span>
                      <span className="hidden text-xs text-muted-foreground sm:block">
                        {subtitle}
                      </span>
                      {isSelected && (
                        <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary">
                          <ChevronDown className="size-3" aria-hidden />
                          Charted below
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <SlotCells slot={slot} />
                </TableRow>
              );
            })}
            {!slots.length && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={4}
                  className="px-6 py-8 text-center text-sm text-muted-foreground"
                >
                  No data available for this line.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
