import React from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('reliability');
  const data = reliability.data ?? [];
  const stats = reliability.data ? getTheRideStats(reliability.data) : null;
  const color = LINE_COLORS['line-RIDE'];
  const ready = [reliability, startDate, endDate];
  const hasNoShows = data.some((e) => e.noShows != null);

  return (
    <>
      {stats && (
        <StatCardGrid>
          <StatCard label={t('ride.stats.onTime')} value={formatPercent(stats.onTime)} />
          <StatCard label={t('ride.stats.tripsPerDay')} value={formatCount(stats.tripsPerDay)} />
          <StatCard label={t('ride.stats.missed')} value={formatCount(stats.missed)} />
          <StatCard label={t('ride.stats.noShows')} value={formatCount(stats.noShows)} />
        </StatCardGrid>
      )}
      <Widget title={t('onTimePerformance')} subtitle={t('ride.onTimeSubtitle')} ready={ready}>
        <ReliabilityGraph
          data={[
            {
              label: t('onTime'),
              data: toPoints(data, (e) => percent(e.onTime, e.completed)),
              style: { color },
            },
            ...(hasNoShows
              ? [
                  {
                    label: t('ride.series.mbtaOtp'),
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
          valueAxisLabel={t('onTime')}
        />
      </Widget>
      <Widget title={t('ride.tripsPerDay')} ready={ready}>
        <ReliabilityGraph
          data={[
            {
              label: t('ride.series.completed'),
              data: toPoints(data, (e) => perDay(e, e.completed)),
              style: { color },
            },
            {
              label: t('ride.series.requested'),
              data: toPoints(data, (e) => perDay(e, e.requests)),
              style: { color: CHART_COLORS.BLUE },
            },
          ]}
          agg={agg}
          startDate={startDate!}
          endDate={endDate!}
          kind="count"
          valueAxisLabel={t('ride.tripsPerDay')}
        />
      </Widget>
      {hasNoShows && (
        <Widget title={t('ride.missedPerDay')} ready={ready}>
          <ReliabilityGraph
            data={[
              {
                label: t('ride.stats.missed'),
                data: toPoints(data, (e) => perDay(e, e.missed)),
                style: { color: CHART_COLORS.RED },
              },
              {
                label: t('ride.stats.noShows'),
                data: toPoints(data, (e) => perDay(e, e.noShows)),
                style: { color: CHART_COLORS.GREY },
              },
            ]}
            agg={agg}
            startDate={startDate!}
            endDate={endDate!}
            kind="count"
            valueAxisLabel={t('ride.perDay')}
          />
        </Widget>
      )}
    </>
  );
};
