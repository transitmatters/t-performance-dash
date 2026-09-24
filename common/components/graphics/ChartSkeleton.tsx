import React from 'react';
import { Skeleton } from '../ui/skeleton';

/**
 * Loading state for a chart card. A bare spinner said only "something is happening"; a shape that
 * matches the chart about to arrive says what is coming and holds its space, so the card does not
 * resize under the reader when data lands. Matches the redesigned pages, which already load this way.
 */
export const ChartSkeleton: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
  // Static, uneven heights: a plot silhouette rather than a row of identical bars.
  const bars = [45, 70, 38, 82, 56, 91, 64, 48, 75, 60, 86, 52];

  return (
    <div
      role="status"
      aria-label="Loading chart"
      className={`flex w-full flex-col justify-end gap-2 ${isMobile ? 'h-48' : 'h-60'}`}
    >
      <div className="flex flex-1 flex-row items-end gap-1.5 pt-2">
        {bars.map((height, index) => (
          <Skeleton
            key={index}
            className="min-w-0 flex-1 rounded-sm"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      {/* Stands in for the x-axis tick row. */}
      <div className="flex flex-row justify-between">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-2.5 w-10" />
        ))}
      </div>
      <span className="sr-only">Loading chart data…</span>
    </div>
  );
};
