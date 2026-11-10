import type { ReactNode } from 'react';
import type { StatDelta, StatSentiment } from '../../utils/statDelta';
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

export type { StatSentiment };

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  delta?: StatDelta;
}

const badgeVariantFor = (sentiment: StatSentiment) =>
  sentiment === 'good'
    ? ('success' as const)
    : sentiment === 'bad'
      ? ('destructive' as const)
      : ('outline' as const);

const DeltaBadge = ({ delta }: { delta: StatDelta }) => {
  const badge = <Badge variant={badgeVariantFor(delta.sentiment)}>{delta.label}</Badge>;
  if (!delta.detail) return badge;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${delta.label}: ${delta.detail}`}
          className="cursor-pointer rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {badge}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto max-w-xs">
        {delta.detail}
      </PopoverContent>
    </Popover>
  );
};

/** The row of headline numbers at the top of a page. One grid, so every page's stats line up the same way. */
export const StatCardGrid = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{children}</div>
);

export const StatCard = ({ label, value, unit, delta }: StatCardProps) => (
  <Card>
    <CardHeader>
      <CardDescription>{label}</CardDescription>
      <CardTitle className="text-2xl font-semibold tabular-nums">
        {value}
        {unit && <span className="text-sm font-normal text-muted-foreground"> {unit}</span>}
      </CardTitle>
      {delta && (
        <CardAction>
          <DeltaBadge delta={delta} />
        </CardAction>
      )}
    </CardHeader>
  </Card>
);
