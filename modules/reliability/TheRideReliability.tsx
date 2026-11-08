import type { UseQueryResult } from '@tanstack/react-query';
import { Widget } from '../../common/components/widgets';
import { StatCard, StatCardGrid } from '../../common/components/widgets/StatCard';
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

export const TheRideReliability = ({
  reliability,
  agg,
  startDate,
  endDate,
}: TheRideReliabilityProps) => {
  const data = reliability.data ?? [];
  const stats = reliability.data ? getTheRideStats(reliability.data) : null;
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
          line="line-RIDE"
          data={[
            {
              label: 'On time',
              data: toPoints(data, (e) => percent(e.onTime, e.completed)),
            },
            ...(hasNoShows
              ? [
                  {
                    label: 'MBTA OTP (no-shows count as on time)',
                    data: toPoints(data, mbtaOtp),
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
          line="line-RIDE"
          data={[
            {
              label: 'Completed',
              data: toPoints(data, (e) => perDay(e, e.completed)),
            },
            {
              label: 'Requested',
              data: toPoints(data, (e) => perDay(e, e.requests)),
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
            line="line-RIDE"
            data={[
              {
                label: 'Missed trips',
                data: toPoints(data, (e) => perDay(e, e.missed)),
              },
              {
                label: 'Rider no-shows',
                data: toPoints(data, (e) => perDay(e, e.noShows)),
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
