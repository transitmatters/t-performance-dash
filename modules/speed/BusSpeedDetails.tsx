'use client';

import React from 'react';
import { useBusSpeedLeaderboard, useBusTripMetrics } from '../../common/api/hooks/busTripMetrics';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { BusDataNotice } from '../../common/components/notices/BusDataNotice';
import { Widget } from '../../common/components/widgets';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { WidgetTitle } from '../../common/components/widgets/WidgetTitle';
import { Layout } from '../../common/layouts/layoutTypes';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { useDelimitatedRoute } from '../../common/utils/router';
import { BusSpeedLeaderboard } from './BusSpeedLeaderboard';
import { SPEED_RANGE_PARAM_MAP } from './constants/speeds';
import { SpeedGraphWrapper } from './SpeedGraphWrapper';

// Bus trip metrics are daily-only -- there's no weekly/monthly rollup table like rail's --
// so the graph is always configured for day-level granularity, regardless of range length.
const config = SPEED_RANGE_PARAM_MAP.day;

const LEADERBOARD_SIZE = 10;

export function BusSpeedDetails() {
  const {
    query: { startDate, endDate, busRoute },
  } = useDelimitatedRoute();
  const enabled = Boolean(startDate && endDate && busRoute);
  const speeds = useBusTripMetrics(
    { start_date: startDate, end_date: endDate, route: busRoute },
    enabled
  );

  const leaderboardEnabled = Boolean(startDate && endDate);
  const leaderboard = useBusSpeedLeaderboard(
    { start_date: startDate, end_date: endDate, limit: LEADERBOARD_SIZE },
    leaderboardEnabled
  );

  if (!startDate || !endDate) {
    return <p>Select a date range to load graphs.</p>;
  }

  const renderLeaderboard = () => {
    if (leaderboard.isError || !leaderboard.data) return <ChartPlaceHolder query={leaderboard} />;
    if (leaderboard.data.length < 1) return <NoDataNotice isLineMetric />;
    return <BusSpeedLeaderboard data={leaderboard.data} />;
  };

  return (
    <PageWrapper pageTitle={'Speed'}>
      <ChartPageDiv>
        <BusDataNotice />
        <Widget title="Speed" ready={[speeds]}>
          <SpeedGraphWrapper
            data={speeds.data!}
            config={config}
            startDate={startDate}
            endDate={endDate}
          />
        </Widget>
        <WidgetDiv>
          <WidgetTitle title="Slowest routes" subtitle="Ranked by average speed" />
          {renderLeaderboard()}
        </WidgetDiv>
      </ChartPageDiv>
    </PageWrapper>
  );
}

BusSpeedDetails.Layout = Layout.Dashboard;
