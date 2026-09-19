'use client';

import React, { useState } from 'react';
import { useBusSpeedLeaderboard } from '../../common/api/hooks/busTripMetrics';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { BusDataNotice } from '../../common/components/notices/BusDataNotice';
import { ToggleSwitch } from '../../common/components/inputs/ToggleSwitch';
import { Button } from '../../common/components/ui/button';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { WidgetTitle } from '../../common/components/widgets/WidgetTitle';
import { KEY_BUS_ROUTE_IDS } from '../../common/constants/lines';
import { Layout } from '../../common/layouts/layoutTypes';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { useDelimitatedRoute } from '../../common/utils/router';
import { BusSpeedLeaderboard } from './BusSpeedLeaderboard';

const KEY_BUS_ROUTES = new Set(KEY_BUS_ROUTE_IDS);

// The backend caches the full ranked list regardless of the requested limit (see
// bus_speed_leaderboard's docstring), so fetching its max up front is free -- it lets "Show all"
// expand instantly from data already in hand instead of firing a second request.
const LEADERBOARD_FETCH_LIMIT = 200;
const LEADERBOARD_PREVIEW_SIZE = 25;

export function BusSpeedLeaderboardDetails() {
  const {
    query: { startDate, endDate },
  } = useDelimitatedRoute();
  const [showAll, setShowAll] = useState(false);
  const [keyRoutesOnly, setKeyRoutesOnly] = useState(false);

  const enabled = Boolean(startDate && endDate);
  const leaderboard = useBusSpeedLeaderboard(
    { start_date: startDate, end_date: endDate, limit: LEADERBOARD_FETCH_LIMIT },
    enabled
  );

  if (!startDate || !endDate) {
    return <p>Select a date range to load the leaderboard.</p>;
  }

  const renderLeaderboard = () => {
    if (leaderboard.isError || !leaderboard.data) return <ChartPlaceHolder query={leaderboard} />;

    const ranked = keyRoutesOnly
      ? leaderboard.data.filter((entry) => KEY_BUS_ROUTES.has(entry.route))
      : leaderboard.data;
    if (ranked.length < 1) return <NoDataNotice isLineMetric />;

    const hasMore = ranked.length > LEADERBOARD_PREVIEW_SIZE;
    const visible = showAll ? ranked : ranked.slice(0, LEADERBOARD_PREVIEW_SIZE);

    return (
      <>
        <BusSpeedLeaderboard data={visible} />
        {hasMore && (
          <Button
            variant="outline"
            size="sm"
            className="mt-3 self-center"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show top 25' : `Show all ${ranked.length} routes`}
          </Button>
        )}
      </>
    );
  };

  return (
    <PageWrapper pageTitle={'Bus speed leaderboard'}>
      <ChartPageDiv>
        <BusDataNotice />
        <WidgetDiv>
          <WidgetTitle
            title="Slowest routes"
            subtitle="Ranked by average speed"
            action={
              <ToggleSwitch
                enabled={keyRoutesOnly}
                setEnabled={setKeyRoutesOnly}
                label="Key bus routes only"
              />
            }
          />
          <div className="flex flex-col">{renderLeaderboard()}</div>
        </WidgetDiv>
      </ChartPageDiv>
    </PageWrapper>
  );
}

BusSpeedLeaderboardDetails.Layout = Layout.Dashboard;
