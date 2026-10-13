import React from 'react';
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
import { SPAN_HOURS, formatCount, formatMinutes, formatShare, getScorecardStats } from './utils';

interface ScorecardTableProps {
  data: CrScorecardEntry[];
}

/** Every line side by side, closest to Regional Rail first. */
export const ScorecardTable: React.FC<ScorecardTableProps> = ({ data }) => {
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
            <TableCell className="text-right tabular-nums">
              {formatCount(row.hoursAtTarget)} of {SPAN_HOURS}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatMinutes(row.maxGapMidday)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatMinutes(row.maxGapEvening)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatShare(row.clockFaceShare)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
