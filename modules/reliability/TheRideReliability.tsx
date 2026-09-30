import React from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { Widget } from '../../common/components/widgets';
import { StatCard, StatCardGrid } from '../../common/components/widgets/StatCard';
import { CHART_COLORS, LINE_COLORS } from '../../common/constants/colors';
import type { ReliabilityEntry } from '../../common/types/dataPoints';
import type { AggType } from '../speed/constants/speeds';
import { ReliabilityGraph } from './charts/ReliabilityGraph';
import { formatCount, formatPercent, getTheRideStats, percent, perDay, toPoints } from './utils';

interface TheRideReliabilityProps {
  reliability: UseQueryResult<ReliabilityEntry[]>;
  agg: AggType;
  startDate?: string;
  endDate?: string;
}

// MBTA's published RIDE OTP counts rider no-shows as on time; only computable from Jan 2026.
const mbtaOtp = (e: ReliabilityEntry) =>
  e.noShows != null && e.missed != null
    ? percent((e.onTime ?? 0) + e.noShows, (e.completed ?? 0) + e.missed + e.noShows)
    : undefined;

export const TheRideReliability: React.FC<TheRideReliabilityProps> = ({
  reliability,
  agg,
  startDate,
  endDate,
}) => {
  const data = reliability.data ?? [];
  const stats = reliability.data ? getTheRideStats(reliability.data) : null;
  const color = LINE_COLORS['line-RIDE'];
  const ready = [reliability, startDate, endDate];
  const hasNoShows = data.some((e) => e.noShows != null);

  return (
    <>
      {stats && (
        <StatCardGrid>
          <StatCard label="Completed trips on time" value={formatPercent(stats.onTime)} />
          <StatCard label="Completed trips per day" value={formatCount(stats.tripsPerDay)} />
          <StatCard label="Missed trips" value={formatCount(stats.missed)} />
          <StatCard label="Rider no-shows" value={formatCount(stats.noShows)} />
        </StatCardGrid>
      )}
      <Widget
        title="On-time performance"
        subtitle="Share of completed trips that picked up on time"
        ready={ready}
      >
        <ReliabilityGraph
          data={[
            {
              label: 'On time',
              data: toPoints(data, (e) => percent(e.onTime, e.completed)),
              style: { color },
            },
            ...(hasNoShows
              ? [
                  {
                    label: 'MBTA OTP (no-shows count as on time)',
                    data: toPoints(data, mbtaOtp),
                    style: { color: CHART_COLORS.BLUE },
                  },
                ]
              : []),
          ]}
          agg={agg}
          startDate={startDate!}
          endDate={endDate!}
          kind="percent"
          valueAxisLabel="On time"
        />
      </Widget>
      <Widget title="Trips per day" ready={ready}>
        <ReliabilityGraph
          data={[
            {
              label: 'Completed',
              data: toPoints(data, (e) => perDay(e, e.completed)),
              style: { color },
            },
            {
              label: 'Requested',
              data: toPoints(data, (e) => perDay(e, e.requests)),
              style: { color: CHART_COLORS.BLUE },
            },
          ]}
          agg={agg}
          startDate={startDate!}
          endDate={endDate!}
          kind="count"
          valueAxisLabel="Trips per day"
        />
      </Widget>
      {hasNoShows && (
        <Widget title="Missed trips and no-shows per day" ready={ready}>
          <ReliabilityGraph
            data={[
              {
                label: 'Missed trips',
                data: toPoints(data, (e) => perDay(e, e.missed)),
                style: { color: CHART_COLORS.RED },
              },
              {
                label: 'Rider no-shows',
                data: toPoints(data, (e) => perDay(e, e.noShows)),
                style: { color: CHART_COLORS.GREY },
              },
            ]}
            agg={agg}
            startDate={startDate!}
            endDate={endDate!}
            kind="count"
            valueAxisLabel="Per day"
          />
        </Widget>
      )}
    </>
  );
};
