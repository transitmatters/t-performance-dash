'use client';

import React, { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { BusSpeedDataUnavailableError } from '../../../common/api/busSpeedSegments';
import { useBusSpeedSegmentsUrl } from '../../../common/api/hooks/busSpeedSegments';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
import { ErrorNotice } from '../../../common/components/notices/ErrorNotice';
import { NoDataNotice } from '../../../common/components/notices/NoDataNotice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../common/components/ui/dialog';
import { getBusRouteDisplayName } from '../../../common/constants/lines';
import { BusSpeedMapViewLazy } from '../map/BusSpeedMapViewLazy';
import type { BusSpeedSegmentLeaderboardEntry, DayType, Period, TimeBand } from '../types';

interface BusSpeedSegmentMapDialogProps {
  entry: BusSpeedSegmentLeaderboardEntry | undefined;
  date: string | undefined;
  period: Period;
  dayType: DayType;
  timeBand: TimeBand;
  onClose: () => void;
}

export const BusSpeedSegmentMapDialog: React.FC<BusSpeedSegmentMapDialogProps> = ({
  entry,
  date,
  period,
  dayType,
  timeBand,
  onClose,
}) => {
  const open = Boolean(entry);

  // Radix keeps the dialog mounted through its closing animation, but `entry` itself goes
  // undefined the instant the parent clears its selection -- rendering straight off `entry`
  // would blank the dialog's content out from under that animation. Retaining the last real
  // entry (React's "adjust state during render" pattern, no effect needed) keeps the segment's
  // name and map visible while the dialog fades out.
  const [lastEntry, setLastEntry] = useState(entry);
  if (entry && entry !== lastEntry) setLastEntry(entry);

  const segments = useBusSpeedSegmentsUrl({ date, period }, open && Boolean(date));

  const renderMap = () => {
    if (!lastEntry) return null;
    if (segments.isLoading) return <ChartPlaceHolder />;
    // The same date/period that produced this leaderboard entry should always have a
    // matching pmtiles file too -- they're generated together -- but fall back to the
    // ordinary "no data" notice rather than assuming that can never fail.
    if (segments.error instanceof BusSpeedDataUnavailableError)
      return <NoDataNotice isLineMetric />;
    if (segments.isError || !segments.data) return <ChartPlaceHolder query={segments} />;

    return (
      // A browser without usable WebGL throws while rendering the map rather than in a
      // query, which would otherwise take the whole dialog down with it.
      <ErrorBoundary fallbackRender={() => <ErrorNotice />}>
        <BusSpeedMapViewLazy
          pmtilesUrl={segments.data}
          period={period}
          dayType={dayType}
          timeBand={timeBand}
          direction={lastEntry.direction_id === 1 ? 'inbound' : 'outbound'}
          routeFilter={lastEntry.route_id}
          segmentStops={{ from: lastEntry.from_stop_name, to: lastEntry.to_stop_name }}
        />
      </ErrorBoundary>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        {lastEntry && (
          <>
            <DialogHeader>
              <DialogTitle>
                Route {getBusRouteDisplayName(lastEntry.route_id)}
                <span className="font-normal text-stone-600">
                  {' '}
                  · {lastEntry.direction_id === 1 ? 'Inbound' : 'Outbound'}
                </span>
              </DialogTitle>
              <p className="text-sm text-stone-600">
                {lastEntry.from_stop_name} → {lastEntry.to_stop_name}
              </p>
            </DialogHeader>
            <div className="h-72 w-full overflow-hidden rounded-lg sm:h-96">{renderMap()}</div>
            <p className="text-sm text-stone-600">
              <span className="font-semibold text-stone-900">
                {lastEntry.p50_speed_mph.toFixed(1)} mph
              </span>{' '}
              · Median of {lastEntry.n_traversals} trips
              {lastEntry.n_interpolated > 0 &&
                `, ${lastEntry.n_interpolated} with an interpolated stop time`}
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
