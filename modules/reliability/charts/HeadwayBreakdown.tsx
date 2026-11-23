import type { HeadwayCounts } from '../../../common/types/dataPoints';
import { NoDataNotice } from '../../../common/components/notices/NoDataNotice';
import { patternStyle } from '../../../common/utils/chartPatterns';
import { isColorblindMode } from '../../../common/utils/colorVision';
import { formatCount, formatPercent, HEADWAY_BUCKETS } from '../utils';

interface HeadwayBreakdownProps {
  counts: HeadwayCounts;
}

/**
 * Every headway in the range, split by its ratio to the scheduled headway: one bar that adds up
 * to 100%, with the share and count of each bucket listed underneath. The list carries the values,
 * so the two yellow buckets are told apart by position and label, not color.
 * In colorblind mode a pattern marks the side of the schedule too: hatching for closer, dots for longer.
 */
export const HeadwayBreakdown = ({ counts }: HeadwayBreakdownProps) => {
  const total = HEADWAY_BUCKETS.reduce((sum, { field }) => sum + counts[field], 0);
  if (!total) return <NoDataNotice isLineMetric />;

  const colorblind = isColorblindMode();
  const fill = (
    color: string,
    pattern: (typeof HEADWAY_BUCKETS)[number]['pattern'],
    tile?: number
  ) => (colorblind ? patternStyle(color, pattern, tile) : { backgroundColor: color });
  const buckets = HEADWAY_BUCKETS.map((bucket) => ({
    ...bucket,
    count: counts[bucket.field],
    share: (100 * counts[bucket.field]) / total,
  }));
  const describe = ({ label, range, share }: (typeof buckets)[number]) =>
    `${label} (${range} of scheduled): ${formatPercent(share)}`;

  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex h-8 w-full gap-0.5 overflow-hidden rounded"
        role="img"
        aria-label={buckets.map(describe).join(', ')}
      >
        {buckets
          .filter(({ count }) => count > 0)
          .map((bucket) => (
            <div
              key={bucket.field}
              title={describe(bucket)}
              className="h-full min-w-0.5"
              // Grow by count so the 2px gaps come out of the segments, not past the end
              style={{
                flexGrow: bucket.count,
                flexBasis: 0,
                ...fill(bucket.color, bucket.pattern),
              }}
            />
          ))}
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-5">
        {buckets.map(({ field, label, range, color, pattern, count, share }) => (
          <li key={field} className="flex flex-col gap-0.5">
            <span className="flex items-center gap-1.5 text-sm text-foreground">
              <span
                aria-hidden
                className="h-3 w-3 shrink-0 rounded-sm"
                style={fill(color, pattern, 5)}
              />
              {label}
              <span className="text-muted-foreground">{range}</span>
            </span>
            <span className="text-xl font-semibold text-foreground tabular-nums">
              {formatPercent(share)}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatCount(count)} headways
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
