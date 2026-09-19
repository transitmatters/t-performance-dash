'use client';

import React, { useState } from 'react';
import { useBusSpeedLeaderboard } from '../../../common/api/hooks/busTripMetrics';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
import { NoDataNotice } from '../../../common/components/notices/NoDataNotice';
import { Button } from '../../../common/components/ui/button';
import { KEY_BUS_ROUTE_IDS } from '../../../common/constants/lines';
import type { Period } from '../types';
import { periodDateRange } from '../utils';
import { BusSpeedRouteLeaderboard } from './BusSpeedRouteLeaderboard';

const KEY_BUS_ROUTES = new Set(KEY_BUS_ROUTE_IDS);
const LEADERBOARD_PREVIEW_SIZE = 25;
// The backend caches the full ranked list regardless of the requested limit (see
// bus_speed_leaderboard's docstring), so fetching its max up front is free -- it lets "Show
// all" expand instantly from data already in hand instead of firing a second request.
const LEADERBOARD_FETCH_LIMIT = 200;

interface BusSpeedRouteLeaderboardSectionProps {
  date: string | undefined;
  period: Period;
  keyRoutesOnly: boolean;
}

export const BusSpeedRouteLeaderboardSection: React.FC<BusSpeedRouteLeaderboardSectionProps> = ({
  date,
  period,
  keyRoutesOnly,
}) => {
  const [showAll, setShowAll] = useState(false);

  const dateRange = date ? periodDateRange(date, period) : undefined;
  const leaderboard = useBusSpeedLeaderboard(
    { ...dateRange, limit: LEADERBOARD_FETCH_LIMIT },
    Boolean(dateRange)
  );

  if (!date) return <p>Select a date to load the leaderboard.</p>;
  if (leaderboard.isError || !leaderboard.data) return <ChartPlaceHolder query={leaderboard} />;

  const ranked = keyRoutesOnly
    ? leaderboard.data.filter((entry) => KEY_BUS_ROUTES.has(entry.route))
    : leaderboard.data;
  if (ranked.length < 1) return <NoDataNotice isLineMetric />;

  const hasMore = ranked.length > LEADERBOARD_PREVIEW_SIZE;
  const visible = showAll ? ranked : ranked.slice(0, LEADERBOARD_PREVIEW_SIZE);

  return (
    <>
      <BusSpeedRouteLeaderboard data={visible} />
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
    </>
  );
};
