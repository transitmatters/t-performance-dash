import React from 'react';
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

export const StatCard: React.FC<StatCardProps> = ({ label, value, unit, delta }) => (
  <Card>
    <CardHeader>
      <CardDescription>{label}</CardDescription>
      <CardTitle className="text-2xl font-semibold tabular-nums">
        {value}
        {unit && <span className="text-muted-foreground text-sm font-normal"> {unit}</span>}
      </CardTitle>
      {delta && (
        <CardAction>
          <Badge variant={badgeVariantFor(delta.sentiment)}>{delta.label}</Badge>
        </CardAction>
      )}
    </CardHeader>
  </Card>
);
