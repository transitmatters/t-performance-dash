import type { HeadwayCounts } from '../../../common/types/dataPoints';
import { NoDataNotice } from '../../../common/components/notices/NoDataNotice';
import { formatCount, formatPercent, HEADWAY_BUCKETS } from '../utils';

interface HeadwayBreakdownProps {
  counts: HeadwayCounts;
}

/**
 * Every headway in the range, split by its ratio to the scheduled headway: one bar that adds up
 * to 100%, with the share and count of each bucket listed underneath. The list carries the values,
 * so the two yellow (and two red) buckets are told apart by position and label, not color.
 */
export const HeadwayBreakdown = ({ counts }: HeadwayBreakdownProps) => {
  const total = HEADWAY_BUCKETS.reduce((sum, { field }) => sum + counts[field], 0);
  if (!total) return <NoDataNotice isLineMetric />;

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
              style={{ flexGrow: bucket.count, flexBasis: 0, backgroundColor: bucket.color }}
            />
          ))}
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-5">
        {buckets.map(({ field, label, range, color, count, share }) => (
          <li key={field} className="flex flex-col gap-0.5">
            <span className="flex items-center gap-1.5 text-sm text-foreground">
              <span
                aria-hidden
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: color }}
              />
              {label}
              <span className="text-muted-foreground">{range}</span>
            </span>
            <span className="text-lg font-semibold text-foreground tabular-nums">
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
