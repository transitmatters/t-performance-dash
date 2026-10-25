import type { FC, ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../common/components/ui/table';
import type { CommuterRailRoute } from '../../../common/types/lines';
import { COMMUTER_RAIL_LINE_NAMES } from '../../../common/types/lines';
import type { CrScorecardEntry } from '../../../common/types/dataPoints';
import { NoDataNotice } from '../../../common/components/notices/NoDataNotice';
import { cn } from '../../../common/utils/cn';
import {
  SPAN_HOURS,
  TONE_CHIP,
  clockFaceTone,
  formatCount,
  formatMinutes,
  formatShare,
  getScorecardStats,
  hoursTone,
  waitTone,
} from './utils';
import type { Tone } from './utils';

const Toned: FC<{
  value: number | undefined;
  tone: (value: number) => Tone;
  children: ReactNode;
}> = ({ value, tone, children }) => (
  <TableCell className="text-right tabular-nums">
    <span className={cn('rounded-md px-1.5 py-0.5', value != null && TONE_CHIP[tone(value)])}>
      {children}
    </span>
  </TableCell>
);

const Swatch: FC<{ tone: Tone; children: ReactNode }> = ({ tone, children }) => (
  <span className={cn('rounded-md px-1 py-0.5 font-medium', TONE_CHIP[tone])}>{children}</span>
);

interface ScorecardTableProps {
  data: CrScorecardEntry[];
}

/** Every line side by side, closest to Regional Rail first. */
export const ScorecardTable: FC<ScorecardTableProps> = ({ data }) => {
  const rows = data
    // Lines the dashboard knows about; leaves out event-only service like Foxboro
    .filter((entry) => entry.routeId && entry.routeId in COMMUTER_RAIL_LINE_NAMES)
    .map((entry) => ({
      routeId: entry.routeId as CommuterRailRoute,
      ...getScorecardStats([entry]),
    }))
    .sort(
      (a, b) =>
        (b.hoursAtTarget ?? 0) - (a.hoursAtTarget ?? 0) ||
        (a.maxGapMidday ?? Infinity) - (b.maxGapMidday ?? Infinity)
    );
  if (rows.length === 0) {
    return <NoDataNotice isLineMetric />;
  }
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Line</TableHead>
            <TableHead className="text-right">Trains / day</TableHead>
            <TableHead className="text-right">Hours every 30 min</TableHead>
            <TableHead className="text-right">Longest midday wait</TableHead>
            <TableHead className="text-right">Longest evening wait</TableHead>
            <TableHead className="text-right">Clock-face</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.routeId}>
              <TableCell className="font-medium">{COMMUTER_RAIL_LINE_NAMES[row.routeId]}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCount(row.tripsPerDay)}
              </TableCell>
              <Toned value={row.hoursAtTarget} tone={hoursTone}>
                {formatCount(row.hoursAtTarget)} of {SPAN_HOURS}
              </Toned>
              <Toned value={row.maxGapMidday} tone={waitTone}>
                {formatMinutes(row.maxGapMidday)}
              </Toned>
              <Toned value={row.maxGapEvening} tone={waitTone}>
                {formatMinutes(row.maxGapEvening)}
              </Toned>
              <Toned value={row.clockFaceShare} tone={clockFaceTone}>
                {formatShare(row.clockFaceShare)}
              </Toned>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="mt-3 text-xs leading-6 text-muted-foreground">
        <Swatch tone="meets">Green</Swatch> meets Regional Rail: all {SPAN_HOURS} hours with a train
        every 30 minutes, no wait over 30 minutes, 90%+ of trains on a clock-face pattern.{' '}
        <Swatch tone="partway">Amber</Swatch> is partway: at least half the hours, hourly waits, or
        half the trains. <Swatch tone="far">Red</Swatch> is further off.
      </p>
    </>
  );
};
