import type { FC, ReactNode } from 'react';
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

export type StatSentiment = 'good' | 'bad' | 'flat';

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  delta?: { label: string; sentiment: StatSentiment };
}

const badgeVariantFor = (sentiment: StatSentiment) =>
  sentiment === 'good'
    ? ('success' as const)
    : sentiment === 'bad'
      ? ('destructive' as const)
      : ('outline' as const);

/** The row of headline numbers at the top of a page. One grid, so every page's stats line up the same way. */
export const StatCardGrid: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{children}</div>
);

export const StatCard: FC<StatCardProps> = ({ label, value, unit, delta }) => (
  <Card>
    <CardHeader>
      <CardDescription>{label}</CardDescription>
      <CardTitle className="text-2xl font-semibold tabular-nums">
        {value}
        {unit && <span className="text-sm font-normal text-muted-foreground"> {unit}</span>}
      </CardTitle>
      {delta && (
        <CardAction>
          <Badge variant={badgeVariantFor(delta.sentiment)}>{delta.label}</Badge>
        </CardAction>
      )}
    </CardHeader>
  </Card>
);
