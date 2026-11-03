import {
  StatCard,
  StatCardGrid,
  type StatSentiment,
} from '../../common/components/widgets/StatCard';
import type { LineDelays } from '../../common/types/delays';
import type { Line } from '../../common/types/lines';
import { formatDelay } from './format';
import { getDelayStats } from './utils';

interface DelayStatsProps {
  data: LineDelays[];
  agg: 'daily' | 'weekly';
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
        label={`Avg per ${agg === 'weekly' ? 'week' : 'day'}`}
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
