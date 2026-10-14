import React from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('reliability');
  const data = reliability.data ?? [];
  const stats = reliability.data ? getCommuterRailStats(reliability.data) : null;
  const color = LINE_COLORS['line-commuter-rail'];
  const ready = [reliability, startDate, endDate];

  return (
    <>
      {stats && (
        <StatCardGrid>
          <StatCard label={t('cr.stats.onTime')} value={formatPercent(stats.onTime)} />
          <StatCard label={t('cr.stats.peakOnTime')} value={formatPercent(stats.peakOnTime)} />
          <StatCard
            label={t('cr.stats.offPeakOnTime')}
            value={formatPercent(stats.offPeakOnTime)}
          />
          <StatCard label={t('cr.stats.cancelled')} value={formatCount(stats.cancelled)} />
        </StatCardGrid>
      )}
      <Widget title={t('onTimePerformance')} subtitle={t('cr.onTimeSubtitle')} ready={ready}>
        <ReliabilityGraph
          data={[
            {
              label: t('cr.series.all'),
              data: toPoints(data, (e) => percent(e.otpNumerator, e.otpDenominator)),
              style: { color },
            },
            {
              label: t('cr.series.peak'),
              data: toPoints(data, (e) => percent(e.peak?.otpNumerator, e.peak?.otpDenominator)),
              style: { color: CHART_COLORS.BLUE, width: 1 },
            },
            {
              label: t('cr.series.offPeak'),
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
          valueAxisLabel={t('onTime')}
        />
      </Widget>
      <Widget title={t('cr.cancelledPerDay')} ready={ready}>
        <ReliabilityGraph
          data={[
            {
              label: t('cr.series.cancelled'),
              data: toPoints(data, (e) => perDay(e, e.cancelled)),
              style: { color: CHART_COLORS.RED },
            },
          ]}
          agg={agg}
          startDate={startDate!}
          endDate={endDate!}
          kind="count"
          valueAxisLabel={t('cr.cancelledAxis')}
        />
      </Widget>
    </>
  );
};
