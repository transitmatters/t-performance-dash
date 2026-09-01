import React from 'react';
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
import { Skeleton } from '../../../common/components/ui/skeleton';
import { Sparkline } from '../../../common/components/charts/Sparkline';
import { RouteBullet } from '../../../common/components/transit/RouteBullet';
import { RouteLine } from '../../../common/components/transit/RouteLine';
import { StationNode } from '../../../common/components/transit/StationNode';
import { RollingNumber } from '../../../common/components/motion/RollingNumber';
import type { ScorecardRow, MetricKey } from './types';

interface MetricsScorecardProps {
  rows: ScorecardRow[];
  isLoading: boolean;
  selectedMetric: MetricKey;
  onSelectMetric: (metric: MetricKey) => void;
}

const badgeVariantFor = (sentiment: ScorecardRow['deltaSentiment']) => {
  if (sentiment === 'good') return 'success' as const;
  if (sentiment === 'bad') return 'destructive' as const;
  return 'outline' as const;
};

export const MetricsScorecard: React.FC<MetricsScorecardProps> = ({
  rows,
  isLoading,
  selectedMetric,
  onSelectMetric,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {/* Bullet is a graphic role → the line's true MBTA hex (rows carry LINE_COLORS), not the
              AA-adjusted --primary used for text/UI. Falls back to currentColor before data loads. */}
          <span style={{ color: rows[0]?.color }}>
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
              <TableHead>Last 30 days</TableHead>
              {/* Full label truncates in the tight 3-column mobile layout; shorten it there. */}
              <TableHead>
                <span className="md:hidden">Vs prev</span>
                <span className="hidden md:inline">Vs previous 30 days</span>
              </TableHead>
              <TableHead className="hidden pr-6 md:table-cell">12 months</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody role="radiogroup" aria-label="Select a metric to chart below">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`} className="hover:bg-transparent">
                    <TableCell className="pl-12">
                      <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-36" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell className="hidden w-full pr-6 md:table-cell">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : rows.map((row, index) => {
                  const isSelected = row.key === selectedMetric;
                  return (
                    <TableRow
                      key={row.key}
                      onClick={() => onSelectMetric(row.key)}
                      // SAFETY: CSS custom properties (--*) are valid CSS but absent from React.CSSProperties; the cast lets them pass to the DOM.
                      style={{ '--reveal-index': index } as React.CSSProperties}
                      className={classNames(
                        'tm-reveal hover:bg-muted/40 cursor-pointer transition-colors',
                        'has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset',
                        isSelected && 'bg-muted/60'
                      )}
                    >
                      <TableCell className="relative pl-12" style={{ color: row.color }}>
                        <input
                          type="radio"
                          name="scorecard-metric"
                          className="sr-only"
                          checked={isSelected}
                          onChange={() => onSelectMetric(row.key)}
                          aria-label={`Chart the ${row.label} metric`}
                        />
                        <span className="pointer-events-none absolute inset-y-0 left-6 flex w-3 -translate-x-1/2 justify-center opacity-30">
                          <RouteLine orientation="vertical" />
                        </span>
                        <span className="pointer-events-none absolute top-1/2 left-6 flex w-3 -translate-x-1/2 -translate-y-1/2 justify-center">
                          <StationNode filled={isSelected} size={isSelected ? 'lg' : 'md'} />
                        </span>
                        <div className="text-foreground flex flex-col gap-0.5">
                          <span className="text-sm font-medium">{row.label}</span>
                          <span className="text-muted-foreground hidden text-xs sm:block">
                            {row.subtitle}
                          </span>
                          {isSelected && (
                            <span className="text-primary mt-1 inline-flex items-center gap-1 text-xs font-medium">
                              <ChevronDown className="size-3" aria-hidden />
                              Charted below
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <RollingNumber
                          value={row.currentValue}
                          format={row.formatValue}
                          className="text-xl font-semibold tabular-nums"
                        />{' '}
                        <span className="text-muted-foreground text-xs">{row.unit}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={badgeVariantFor(row.deltaSentiment)}>
                          <span className="md:hidden">{row.deltaValueLabel}</span>
                          <span className="hidden md:inline">{row.deltaLabel}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden w-full pr-6 md:table-cell">
                        <Sparkline values={row.trend} color={row.color} />
                      </TableCell>
                    </TableRow>
                  );
                })}
            {!isLoading && !rows.length && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground px-6 py-8 text-center text-sm"
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
