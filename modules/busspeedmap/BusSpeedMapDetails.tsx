'use client';

import React, { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useBusSpeedSegmentsUrl } from '../../common/api/hooks/busSpeedSegments';
import { BusSpeedDataUnavailableError } from '../../common/api/busSpeedSegments';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { BusDataNotice } from '../../common/components/notices/BusDataNotice';
import { ErrorNotice } from '../../common/components/notices/ErrorNotice';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { WidgetTitle } from '../../common/components/widgets/WidgetTitle';
import { Layout } from '../../common/layouts/layoutTypes';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { useDelimitatedRoute } from '../../common/utils/router';
import { BusSpeedMapControls } from './controls/BusSpeedMapControls';
import { BusSpeedLegend } from './map/BusSpeedLegend';
import { BusSpeedMapViewLazy as BusSpeedMapView } from './map/BusSpeedMapViewLazy';
import {
  DAY_TYPES,
  DEFAULT_DAY_TYPE,
  DEFAULT_DIRECTION,
  DEFAULT_PERIOD,
  DEFAULT_TIME_BAND,
  TIME_BANDS,
} from './constants';
import type { DayType, DirectionFilter, Period, TimeBand } from './types';
import { isPeriodInProgress, periodLabel } from './utils';

export function BusSpeedMapDetails() {
  const {
    query: { date, busRoute },
  } = useDelimitatedRoute();

  const [period, setPeriod] = useState<Period>(DEFAULT_PERIOD);
  const [dayType, setDayType] = useState<DayType>(DEFAULT_DAY_TYPE);
  const [timeBand, setTimeBand] = useState<TimeBand>(DEFAULT_TIME_BAND);
  const [direction, setDirection] = useState<DirectionFilter>(DEFAULT_DIRECTION);
  // Populated progressively from loaded vector tiles rather than known up front — see
  // BusSpeedMapView's onIdle handler.
  const [routeIds, setRouteIds] = useState<string[]>([]);

  const segments = useBusSpeedSegmentsUrl({ date, period }, Boolean(date));
  const { data: pmtilesUrl } = segments;

  // Driven by the sidebar route picker / URL rather than an in-page control. The picker's
  // list is curated and includes composites like '17/19' that no route_id will ever match,
  // so this only takes effect once the dataset is confirmed to actually have that route --
  // otherwise it falls back to the full network view.
  const routeFilter = busRoute && routeIds.includes(busRoute) ? busRoute : undefined;

  const bandLabel = TIME_BANDS.find((band) => band.key === timeBand);
  const dayTypeLabel = period !== 'daily' ? DAY_TYPES.find((dt) => dt.key === dayType) : undefined;
  const subtitle = [
    periodLabel(date, period),
    dayTypeLabel?.label,
    bandLabel && `${bandLabel.label} · ${bandLabel.hours}`,
  ]
    .filter(Boolean)
    .join(' · ');

  const renderBody = () => {
    if (!date) return <p>Select a date to load the bus speed map.</p>;
    if (segments.isLoading) return <ChartPlaceHolder />;
    // A date with no published file isn't a failure, it's just outside coverage.
    if (segments.error instanceof BusSpeedDataUnavailableError)
      return <NoDataNotice isLineMetric />;
    if (segments.isError || !pmtilesUrl) return <ChartPlaceHolder query={segments} />;

    return (
      <div className="h-[28rem] w-full overflow-hidden rounded-lg md:h-[36rem]">
        {/* A browser without usable WebGL throws while rendering the map rather than in a
            query, which would otherwise take the whole page down with it. */}
        <ErrorBoundary fallbackRender={() => <ErrorNotice />}>
          <BusSpeedMapView
            pmtilesUrl={pmtilesUrl}
            period={period}
            dayType={dayType}
            timeBand={timeBand}
            direction={direction}
            routeFilter={routeFilter}
            onRouteIdsDiscovered={setRouteIds}
          />
        </ErrorBoundary>
      </div>
    );
  };

  return (
    <PageWrapper pageTitle={'Bus speed map'}>
      <ChartPageDiv>
        <BusDataNotice />
        <WidgetDiv>
          <WidgetTitle title="Bus speeds" subtitle={subtitle || undefined} />
          <div className="flex flex-col gap-3">
            <BusSpeedMapControls
              period={period}
              setPeriod={setPeriod}
              dayType={dayType}
              setDayType={setDayType}
              timeBand={timeBand}
              setTimeBand={setTimeBand}
              direction={direction}
              setDirection={setDirection}
            />
            {isPeriodInProgress(date, period) && (
              <p className="text-xs text-stone-500">
                This {period === 'weekly' ? 'week' : 'month'} is still in progress — figures reflect
                service so far, not the full period.
              </p>
            )}
            {renderBody()}
            <BusSpeedLegend />
          </div>
        </WidgetDiv>
      </ChartPageDiv>
    </PageWrapper>
  );
}

BusSpeedMapDetails.Layout = Layout.Dashboard;
