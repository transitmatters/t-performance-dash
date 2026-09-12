'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
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
import { DEFAULT_TIME_BAND, TIME_BANDS } from './constants';
import type { TimeBand } from './types';

// MapLibre reaches for WebGL as soon as it loads, so it must stay out of the static export's
// Node prerender. This also keeps the ~230KB library in a chunk only this page pulls down.
const BusSpeedMapView = dynamic(
  () => import('./map/BusSpeedMapView').then((module) => module.BusSpeedMapView),
  { ssr: false, loading: () => <ChartPlaceHolder /> }
);

export function BusSpeedMapDetails() {
  const {
    query: { date, busRoute },
  } = useDelimitatedRoute();

  const [timeBand, setTimeBand] = useState<TimeBand>(DEFAULT_TIME_BAND);
  const [routeFilter, setRouteFilter] = useState<string>('');
  // Populated progressively from loaded vector tiles rather than known up front — see
  // BusSpeedMapView's onIdle handler.
  const [routeIds, setRouteIds] = useState<string[]>([]);

  const segments = useBusSpeedSegmentsUrl({ date }, Boolean(date));
  const { data: pmtilesUrl } = segments;

  // Arriving from the sidebar route picker should land on that route. The picker's list is
  // curated and includes composites like '17/19' that no route_id will ever match, so this
  // only takes effect once the dataset is confirmed to actually have that route.
  useEffect(() => {
    if (busRoute && routeIds.includes(busRoute)) setRouteFilter(busRoute);
  }, [busRoute, routeIds]);

  const bandLabel = TIME_BANDS.find((band) => band.key === timeBand);

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
            timeBand={timeBand}
            routeFilter={routeFilter || undefined}
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
          <WidgetTitle
            title="Bus speeds"
            subtitle={bandLabel && `${bandLabel.label} · ${bandLabel.hours}`}
          />
          <div className="flex flex-col gap-3">
            <BusSpeedMapControls
              timeBand={timeBand}
              setTimeBand={setTimeBand}
              routeFilter={routeFilter}
              setRouteFilter={setRouteFilter}
              routeIds={routeIds}
            />
            {renderBody()}
            <BusSpeedLegend />
          </div>
        </WidgetDiv>
      </ChartPageDiv>
    </PageWrapper>
  );
}

BusSpeedMapDetails.Layout = Layout.Dashboard;
