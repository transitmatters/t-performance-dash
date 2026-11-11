'use client';
import { useState } from 'react';
import { useBusSpeedLeaderboard } from '../../../common/api/hooks/busTripMetrics';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
import { NoDataNotice } from '../../../common/components/notices/NoDataNotice';
import { Button } from '../../../common/components/ui/button';
import type { LeaderboardMetricConfig, Period } from '../types';
import { groupLeaderboardByBusRoute, periodDateRange, rankAndSetAside } from '../utils';
import { BusDwellSummary } from './BusDwellSummary';
import { BusSpeedRouteLeaderboard } from './BusSpeedRouteLeaderboard';

const LEADERBOARD_PREVIEW_SIZE = 25;
// The backend caches the full ranked list regardless of the requested limit (see
// bus_speed_leaderboard's docstring), so fetching its max up front is free -- it lets "Show
// all" expand instantly from data already in hand instead of firing a second request. It also
// has to cover every raw route_id, since they're grouped into curated labels client-side.
const LEADERBOARD_FETCH_LIMIT = 200;

interface BusSpeedRouteLeaderboardSectionProps {
  date: string | undefined;
  period: Period;
  metric: LeaderboardMetricConfig;
  frequentRoutesOnly: boolean;
}

export const BusSpeedRouteLeaderboardSection = ({
  date,
  period,
  metric,
  frequentRoutesOnly,
}: BusSpeedRouteLeaderboardSectionProps) => {
  const [showAll, setShowAll] = useState(false);

  const dateRange = date ? periodDateRange(date, period) : undefined;
  const leaderboard = useBusSpeedLeaderboard(
    { ...dateRange, limit: LEADERBOARD_FETCH_LIMIT },
    Boolean(dateRange)
  );

  if (!date || !dateRange) return <p>Select a date to load the rankings.</p>;
  if (leaderboard.isError || !leaderboard.data) return <ChartPlaceHolder query={leaderboard} />;

  const grouped = groupLeaderboardByBusRoute(leaderboard.data, dateRange.end_date);
  const routes = frequentRoutesOnly ? grouped.filter((entry) => entry.isFrequentRoute) : grouped;
  if (routes.length < 1) return <NoDataNotice isLineMetric />;
  // Sorted here rather than by the API, which only knows speed.
  const { ranked, setAside } = rankAndSetAside(routes, metric);
  const emptyNotice = <NoDataNotice isLineMetric filtered message={metric.emptyMessage} />;
  if (ranked.length < 1 && setAside.length < 1) return emptyNotice;

  const hasMore = ranked.length > LEADERBOARD_PREVIEW_SIZE;
  const visible = showAll ? ranked : ranked.slice(0, LEADERBOARD_PREVIEW_SIZE);

  return (
    <>
      {ranked.length > 0 ? (
        <BusSpeedRouteLeaderboard data={visible} metric={metric} />
      ) : (
        emptyNotice
      )}
      {hasMore && (
        <Button
          variant="outline"
          size="sm"
          className="mt-3 self-center"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? `Show top ${LEADERBOARD_PREVIEW_SIZE}` : `Show all ${ranked.length} routes`}
        </Button>
      )}
      {metric.setAside && setAside.length > 0 && (
        <section className="mt-2 flex flex-col gap-1 border-t border-border pt-4">
          <h3 className="text-base font-semibold text-foreground">{metric.setAside.title}</h3>
          <p className="text-sm text-muted-foreground">{metric.setAside.description}</p>
          <BusSpeedRouteLeaderboard data={setAside} metric={metric} numbered={false} />
        </section>
      )}
      {metric.note && <p className="text-xs text-muted-foreground">{metric.note}</p>}
      <BusDwellSummary data={routes} />
    </>
  );
};
