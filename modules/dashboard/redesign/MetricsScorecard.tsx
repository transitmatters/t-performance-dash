import React from 'react';
import classNames from 'classnames';

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
import { Progress } from '../../../common/components/ui/progress';
import { Badge } from '../../../common/components/ui/badge';
import { Sparkline } from '../../../common/components/charts/Sparkline';
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
        <CardTitle>Metrics</CardTitle>
        <CardDescription>Select a row to chart it below.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Metric</TableHead>
              <TableHead>This month</TableHead>
              <TableHead>Best on record</TableHead>
              <TableHead>Vs prior month</TableHead>
              <TableHead className="pr-6">12 months</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const isSelected = row.key === selectedMetric;
              return (
                <TableRow
                  key={row.key}
                  onClick={() => onSelectMetric(row.key)}
                  aria-selected={isSelected}
                  className={classNames(
                    'hover:bg-muted/40 cursor-pointer border-l-2 border-l-transparent transition-colors',
                    isSelected && 'bg-muted/60'
                  )}
                  style={isSelected ? { borderLeftColor: row.color } : undefined}
                >
                  <TableCell className="pl-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{row.label}</span>
                      <span className="text-muted-foreground text-xs">{row.subtitle}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xl font-semibold tabular-nums">
                      {row.formattedCurrent}
                    </span>{' '}
                    <span className="text-muted-foreground text-xs">{row.unit}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5 pr-6">
                      <span className="text-xs">{row.benchmarkLabel}</span>
                      {row.percentOfBenchmark !== null && (
                        <Progress
                          value={row.percentOfBenchmark * 100}
                          indicatorClassName="bg-(--row-color)"
                          style={{ '--row-color': row.color } as React.CSSProperties}
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={badgeVariantFor(row.deltaSentiment)}>{row.deltaLabel}</Badge>
                  </TableCell>
                  <TableCell className="w-full pr-6">
                    <Sparkline values={row.trend} color={row.color} />
                  </TableCell>
                </TableRow>
              );
            })}
            {!rows.length && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground px-6 py-8 text-center text-sm"
                >
                  {isLoading ? 'Loading metrics…' : 'No data available for this line.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
