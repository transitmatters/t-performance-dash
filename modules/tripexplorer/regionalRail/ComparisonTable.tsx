import type { ReactNode } from 'react';
import { Badge } from '../../../common/components/ui/badge';
import { cn } from '../../../common/utils/cn';
import { formatClock } from '../../service/regionalRail/utils';
import type { TripSummary } from './utils';
import { DOT_CLASS, formatDuration, percentLess, trainsMultiple } from './utils';

const Value = ({ children, better }: { children?: ReactNode; better?: string }) => (
  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold tabular-nums">
    {children ?? '—'}
    {better && <Badge variant="success">{better}</Badge>}
  </div>
);

const TripTime = ({ trip, better }: { trip: TripSummary | null; better?: string }) =>
  trip ? (
    <>
      <Value better={better}>{formatDuration(trip.end - trip.start)}</Value>
      <div className="text-xs text-muted-foreground tabular-nums">
        {formatClock(trip.start)} – {formatClock(trip.end)}
      </div>
    </>
  ) : (
    <Badge variant="destructive">No train</Badge>
  );

const ColumnHeader = ({ dot, children }: { dot: string; children: ReactNode }) => (
  <th scope="col" className="pb-2 font-medium">
    <span className={cn('mr-1.5 inline-block size-2 rounded-full', dot)} />
    {children}
  </th>
);

const RowHeader = ({ children }: { children: ReactNode }) => (
  <th scope="row" className="pr-3 font-normal text-muted-foreground">
    {children}
  </th>
);

const percent = (value: number | undefined, label: string) =>
  value ? `${value}% ${label}` : undefined;

interface ComparisonTableProps {
  /** Null when today's Commuter Rail has no train for this trip. */
  today: TripSummary | null;
  regionalRail: TripSummary;
}

/** Today's trip and the Regional Rail trip side by side, as the Explorer compares them. */
export const ComparisonTable = ({ today, regionalRail }: ComparisonTableProps) => {
  const duration = (trip: TripSummary) => trip.end - trip.start;
  const faster = today && percentLess(duration(today), duration(regionalRail));
  const lessWait = today && percentLess(today.wait, regionalRail.wait);
  const moreTrains =
    today?.trains && regionalRail.trains
      ? trainsMultiple(today.trains.length, regionalRail.trains.length)
      : undefined;

  return (
    <table className="w-full table-fixed text-left text-sm">
      <thead>
        <tr className="text-xs text-muted-foreground">
          <td className="w-28 pb-2 sm:w-40" />
          <ColumnHeader dot={DOT_CLASS.today}>Today&apos;s Commuter Rail</ColumnHeader>
          <ColumnHeader dot={DOT_CLASS.regionalRail}>Regional Rail</ColumnHeader>
        </tr>
      </thead>
      <tbody className="divide-y divide-border align-top [&_td]:py-2 [&_th]:py-2">
        <tr>
          <RowHeader>Trip time</RowHeader>
          <td>
            <TripTime trip={today} />
          </td>
          <td>
            <TripTime trip={regionalRail} better={percent(faster || undefined, 'faster')} />
          </td>
        </tr>
        <tr>
          <RowHeader>Waiting for a train</RowHeader>
          <td>
            <Value>{today ? formatDuration(today.wait) : undefined}</Value>
          </td>
          <td>
            <Value better={percent(lessWait || undefined, 'less')}>
              {formatDuration(regionalRail.wait)}
            </Value>
          </td>
        </tr>
        <tr>
          <RowHeader>Trains a day</RowHeader>
          <td>
            <Value>{today?.trains?.length}</Value>
          </td>
          <td>
            <Value better={moreTrains && `${moreTrains} as many`}>
              {regionalRail.trains?.length}
            </Value>
          </td>
        </tr>
      </tbody>
    </table>
  );
};
