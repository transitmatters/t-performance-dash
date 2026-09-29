import React from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { Widget } from '../../common/components/widgets';
import { StatCard, StatCardGrid } from '../../common/components/widgets/StatCard';
import { CHART_COLORS, LINE_COLORS } from '../../common/constants/colors';
import type { ReliabilityEntry } from '../../common/types/dataPoints';
import type { AggType } from '../speed/constants/speeds';
import { ReliabilityGraph } from './charts/ReliabilityGraph';
import {
  formatCount,
  formatPercent,
  getCommuterRailStats,
  percent,
  perDay,
  toPoints,
} from './utils';

interface CommuterRailReliabilityProps {
  reliability: UseQueryResult<ReliabilityEntry[]>;
  agg: AggType;
  startDate?: string;
  endDate?: string;
}

export const CommuterRailReliability: React.FC<CommuterRailReliabilityProps> = ({
  reliability,
  agg,
  startDate,
  endDate,
}) => {
  const data = reliability.data ?? [];
  const stats = reliability.data ? getCommuterRailStats(reliability.data) : null;
  const color = LINE_COLORS['line-commuter-rail'];
  const ready = [reliability, startDate, endDate];

  return (
    <>
      {stats && (
        <StatCardGrid>
          <StatCard label="Trains on time" value={formatPercent(stats.onTime)} />
          <StatCard label="Peak on time" value={formatPercent(stats.peakOnTime)} />
          <StatCard label="Off-peak on time" value={formatPercent(stats.offPeakOnTime)} />
          <StatCard label="Cancelled trains" value={formatCount(stats.cancelled)} />
        </StatCardGrid>
      )}
      <Widget
        title="On-time performance"
        subtitle="Share of trains meeting MBTA schedule adherence"
        ready={ready}
      >
        <ReliabilityGraph
          data={[
            {
              label: 'All trains',
              data: toPoints(data, (e) => percent(e.otpNumerator, e.otpDenominator)),
              style: { color },
            },
            {
              label: 'Peak',
              data: toPoints(data, (e) => percent(e.peak?.otpNumerator, e.peak?.otpDenominator)),
              style: { color: CHART_COLORS.BLUE, width: 1 },
            },
            {
              label: 'Off-peak',
              data: toPoints(data, (e) =>
                percent(e.offPeak?.otpNumerator, e.offPeak?.otpDenominator)
              ),
              style: { color: CHART_COLORS.YELLOW, width: 1 },
            },
          ]}
          agg={agg}
          startDate={startDate!}
          endDate={endDate!}
          kind="percent"
          valueAxisLabel="On time"
        />
      </Widget>
      <Widget title="Cancelled trains per day" ready={ready}>
        <ReliabilityGraph
          data={[
            {
              label: 'Cancelled',
              data: toPoints(data, (e) => perDay(e, e.cancelled)),
              style: { color: CHART_COLORS.RED },
            },
          ]}
          agg={agg}
          startDate={startDate!}
          endDate={endDate!}
          kind="count"
          valueAxisLabel="Cancelled per day"
        />
      </Widget>
    </>
  );
};
