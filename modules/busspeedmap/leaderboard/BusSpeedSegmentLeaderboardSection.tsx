'use client';

import React, { useMemo, useState } from 'react';
import { BusSpeedDataUnavailableError } from '../../../common/api/busSpeedSegments';
import { useBusSpeedSegmentLeaderboard } from '../../../common/api/hooks/busSpeedSegments';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
import { NoDataNotice } from '../../../common/components/notices/NoDataNotice';
import { Button } from '../../../common/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../common/components/ui/select';
import { getBusRouteDisplayName, KEY_BUS_ROUTE_IDS } from '../../../common/constants/lines';
import type {
  BusSpeedSegmentLeaderboardByBand,
  BusSpeedSegmentLeaderboardByDayType,
  BusSpeedSegmentLeaderboardEntry,
  DayType,
  Period,
  TimeBand,
} from '../types';
import { selectSegmentLeaderboardEntries } from '../utils';
import { BusSpeedSegmentLeaderboard } from './BusSpeedSegmentLeaderboard';
import { BusSpeedSegmentMapDialog } from './BusSpeedSegmentMapDialog';

const KEY_BUS_ROUTES = new Set(KEY_BUS_ROUTE_IDS);
const LEADERBOARD_PREVIEW_SIZE = 25;
const ALL_ROUTES = 'all';

interface BusSpeedSegmentLeaderboardSectionProps {
  date: string | undefined;
  period: Period;
  dayType: DayType;
  timeBand: TimeBand;
  keyRoutesOnly: boolean;
}

export const BusSpeedSegmentLeaderboardSection: React.FC<
  BusSpeedSegmentLeaderboardSectionProps
> = ({ date, period, dayType, timeBand, keyRoutesOnly }) => {
  const [showAll, setShowAll] = useState(false);
  const [routeFilter, setRouteFilter] = useState(ALL_ROUTES);
  const [selectedSegment, setSelectedSegment] = useState<
    BusSpeedSegmentLeaderboardEntry | undefined
  >();

  const leaderboard = useBusSpeedSegmentLeaderboard({ date, period }, Boolean(date));

  // Every route with at least one segment in this date's file, across every day type/time
  // band rather than just the currently selected one, so the dropdown's options don't
  // shuffle around as those change.
  const availableRoutes = useMemo(() => {
    if (!leaderboard.data) return [];
    const allEntries: BusSpeedSegmentLeaderboardEntry[] =
      period === 'daily'
        ? Object.values(leaderboard.data as BusSpeedSegmentLeaderboardByBand).flat()
        : Object.values(leaderboard.data as BusSpeedSegmentLeaderboardByDayType).flatMap((byBand) =>
            Object.values(byBand).flat()
          );
    const routeIds = new Set(allEntries.map((entry) => entry.route_id));
    return [...routeIds].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  }, [leaderboard.data, period]);

  const renderList = () => {
    if (!date) return <p>Select a date to load the leaderboard.</p>;
    if (leaderboard.isLoading) return <ChartPlaceHolder />;
    // A date with no published file isn't a failure, it's just outside coverage.
    if (leaderboard.error instanceof BusSpeedDataUnavailableError)
      return <NoDataNotice isLineMetric />;
    if (leaderboard.isError || !leaderboard.data) return <ChartPlaceHolder query={leaderboard} />;

    // Entries are pre-filtered server-side to >=20 traversals in this slice, so a thin time
    // band (early_am/late_night especially, on a single day) can come back genuinely empty
    // rather than always ~100 rows.
    const bandEntries = selectSegmentLeaderboardEntries(
      leaderboard.data,
      period,
      dayType,
      timeBand
    );
    const keyFiltered = keyRoutesOnly
      ? bandEntries.filter((entry) => KEY_BUS_ROUTES.has(entry.route_id))
      : bandEntries;
    const entries =
      routeFilter === ALL_ROUTES
        ? keyFiltered
        : keyFiltered.filter((entry) => entry.route_id === routeFilter);
    if (entries.length < 1) return <NoDataNotice isLineMetric />;

    const hasMore = entries.length > LEADERBOARD_PREVIEW_SIZE;
    const visible = showAll ? entries : entries.slice(0, LEADERBOARD_PREVIEW_SIZE);

    return (
      <>
        <BusSpeedSegmentLeaderboard data={visible} onSelectSegment={setSelectedSegment} />
        {hasMore && (
          <Button
            variant="outline"
            size="sm"
            className="mt-3 self-center"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll
              ? `Show top ${LEADERBOARD_PREVIEW_SIZE}`
              : `Show all ${entries.length} segments`}
          </Button>
        )}
      </>
    );
  };

  return (
    <>
      {availableRoutes.length > 0 && (
        <label className="flex items-center gap-2 self-start text-sm">
          <span className="text-stone-600">Route</span>
          <Select value={routeFilter} onValueChange={setRouteFilter}>
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_ROUTES}>All routes</SelectItem>
              {availableRoutes.map((routeId) => (
                <SelectItem key={routeId} value={routeId}>
                  {getBusRouteDisplayName(routeId)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      )}
      {renderList()}
      <BusSpeedSegmentMapDialog
        entry={selectedSegment}
        date={date}
        period={period}
        dayType={dayType}
        timeBand={timeBand}
        onClose={() => setSelectedSegment(undefined)}
      />
    </>
  );
};
