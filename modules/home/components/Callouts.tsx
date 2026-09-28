import React from 'react';
import Link from 'next/link';
import { ThumbsUp, TriangleAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../common/components/ui/card';
import { RouteBullet } from '../../../common/components/transit/RouteBullet';
import { factSentence } from '../copy';
import type { Fact, HomeData, Row } from '../types';

const FactList: React.FC<{ facts: Fact[]; rows: Record<string, Row>; empty: string }> = ({
  facts,
  rows,
  empty,
}) =>
  facts.length ? (
    <ul className="flex flex-col gap-3">
      {facts.map((fact) => {
        const row = rows[fact.rowId];
        const href = row.cells[fact.metric].href ?? row.href;
        return (
          <li key={`${fact.rowId}-${fact.metric}-${fact.key}`} data-line={row.line}>
            <Link href={href} className="group flex items-start gap-2.5 text-sm">
              <span className="text-primary mt-1">
                <RouteBullet size="sm" />
              </span>
              <span className="group-hover:underline">{factSentence(fact, row)}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  ) : (
    <p className="text-muted-foreground text-sm">{empty}</p>
  );

export const Callouts: React.FC<{ data: HomeData }> = ({ data }) => {
  const rows = Object.fromEntries(data.rows.map((row) => [row.id, row]));
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ThumbsUp className="size-4 text-green-700 dark:text-green-400" aria-hidden />
            Wins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FactList facts={data.facts.wins} rows={rows} empty="Nothing stands out this week." />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TriangleAlert className="text-destructive size-4" aria-hidden />
            Needs work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FactList facts={data.facts.issues} rows={rows} empty="Nothing stands out this week." />
        </CardContent>
      </Card>
    </div>
  );
};
