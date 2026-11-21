import { StatCard, StatCardGrid } from '../../common/components/widgets/StatCard';
import type { Line } from '../../common/types/lines';
import { halvesDetail, statDelta } from '../../common/utils/statDelta';
import { type DelayAgg, AGG_PERIOD, formatDelay } from './format';
import type { RangeRow } from './range';
import { getDelayStats } from './utils';

interface DelayStatsProps {
  /** Rows covering exactly the selected dates. */
  data: RangeRow[];
  agg: DelayAgg;
  line?: Line;
}

const deltaFor = (before: number, after: number) => {
  const delta = after - before;
  return statDelta({
    delta,
    negligible: 1,
    magnitude: `${delta > 0 ? '+' : delta < 0 ? '-' : ''}${formatDelay(delta)}`,
    words: ['better', 'worse'],
    higherIsBetter: false,
    detail: halvesDetail(before, after, formatDelay),
  });
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
        delta={deltaFor(stats.avgDelayBefore, stats.avgDelayAfter)}
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
