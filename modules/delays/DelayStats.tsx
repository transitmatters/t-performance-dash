import {
  StatCard,
  StatCardGrid,
  type StatSentiment,
} from '../../common/components/widgets/StatCard';
import type { Line } from '../../common/types/lines';
import { type DelayAgg, AGG_PERIOD, formatDelay } from './format';
import type { RangeRow } from './range';
import { getDelayStats } from './utils';

interface DelayStatsProps {
  /** Rows covering exactly the selected dates. */
  data: RangeRow[];
  agg: DelayAgg;
  line?: Line;
}

const deltaFor = (delta: number) => {
  if (!Number.isFinite(delta)) return undefined;

  const sentiment: StatSentiment = Math.abs(delta) <= 1 ? 'flat' : delta < 0 ? 'good' : 'bad';
  const word = sentiment === 'flat' ? 'flat' : sentiment === 'good' ? 'better' : 'worse';
  const sign = delta > 0 ? '+' : delta < 0 ? '-' : '';

  return { label: `${sign}${formatDelay(delta)} · ${word}`, sentiment };
};

export const DelayStats = ({ data, agg, line }: DelayStatsProps) => {
  const stats = getDelayStats(data, agg, line);
  if (!Number.isFinite(stats.avgDelay)) return null;

  return (
    <StatCardGrid>
      <StatCard label="Total time delayed" value={formatDelay(stats.totalDelay)} />
      <StatCard
        label={`Avg per ${AGG_PERIOD[agg]}`}
        value={formatDelay(stats.avgDelay)}
        delta={deltaFor(stats.avgDelayDelta)}
      />
      {stats.topReasonLabel && stats.topReasonShare != null && (
        <StatCard
          label={`Top cause: ${stats.topReasonLabel}`}
          value={`${Math.round(stats.topReasonShare * 100)}%`}
          unit="of delay time"
        />
      )}
    </StatCardGrid>
  );
};
