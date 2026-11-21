'use client';

import dayjs from 'dayjs';
import { ErrorBoundary } from 'react-error-boundary';
import { useBusDwellsUrl, useBusSpeedSegmentsUrl } from '../../common/api/hooks/busSpeedSegments';
import { BusSpeedDataUnavailableError } from '../../common/api/busSpeedSegments';
import { CopyLinkButton } from '../../common/components/buttons/CopyLinkButton';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { ErrorNotice } from '../../common/components/notices/ErrorNotice';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { getBusRouteDataIds } from '../../common/constants/lines';
import { WidgetTitle } from '../../common/components/widgets/WidgetTitle';
import { Skeleton } from '../../common/components/ui/skeleton';
import { useDelimitatedRoute } from '../../common/utils/router';
import { BusSpeedDataNotes } from './BusSpeedDataNotes';
import { ALL_ROUTES, DAY_TYPES, DIRECTIONS, TIME_BANDS } from './constants';
import { InProgressBadge } from './InProgressBadge';
import { BusSpeedLegend } from './map/BusSpeedLegend';
import { BusSpeedMapViewLazy as BusSpeedMapView } from './map/BusSpeedMapViewLazy';
import { RetiredRouteNotice, serviceEndBefore } from './RetiredRouteNotice';
import {
  useDayType,
  useDirection,
  useRouteId,
  useShownPeriod,
  useTimeBand,
} from './useBusSpeedParams';

export function BusSpeedMapDetails() {
  const {
    query: { date, busRoute },
  } = useDelimitatedRoute();
  const { shown: period } = useShownPeriod();
  const { value: dayType } = useDayType();
  const { value: timeBand } = useTimeBand();
  const { value: direction } = useDirection();
  const { value: routeId } = useRouteId(busRoute ? getBusRouteDataIds(busRoute) : []);

  const segments = useBusSpeedSegmentsUrl({ date, period, timeBand }, Boolean(date));
  const { data: pmtilesUrl } = segments;
  // Null for an archive from before dwell had a layer of its own. Read as running speeds until
  // that's known, as every archive from here on is.
  const { data: dwellsUrl } = useBusDwellsUrl({ date, period, timeBand }, Boolean(date));

  const band = TIME_BANDS.find(({ key }) => key === timeBand);
  // A single day is wholly one day type, so it's named instead.
  const days =
    period === 'daily'
      ? date && dayjs(date).format('dddd')
      : DAY_TYPES.find(({ key }) => key === dayType)?.label;
  const summary = [
    DIRECTIONS.find(({ key }) => key === direction)?.label,
    days,
    band && (band.key === 'all_day' ? band.label : `${band.label}, ${band.hours}`),
  ]
    .filter(Boolean)
    .join(' · ');

  const mapBox = 'h-[28rem] w-full overflow-hidden rounded-lg md:h-[36rem]';

  const renderBody = () => {
    if (!date) return <p>Select a date to load the bus speed map.</p>;
    const serviceEnd = serviceEndBefore(busRoute, date, period);
    if (serviceEnd) return <RetiredRouteNotice serviceEnd={serviceEnd} period={period} />;
    if (segments.isLoading) return <Skeleton className={mapBox} />;
    // A date with no published file isn't a failure, it's just outside coverage.
    if (segments.error instanceof BusSpeedDataUnavailableError)
      return <NoDataNotice isLineMetric />;
    if (segments.isError || !pmtilesUrl) return <ChartPlaceHolder query={segments} />;

    return (
      <>
        <div className={mapBox}>
          {/* A browser without usable WebGL throws while rendering the map rather than in a
            query, which would otherwise take the whole page down with it. */}
          <ErrorBoundary fallbackRender={() => <ErrorNotice />}>
            <BusSpeedMapView
              pmtilesUrl={pmtilesUrl}
              dwellsUrl={dwellsUrl ?? undefined}
              period={period}
              dayType={dayType}
              timeBand={timeBand}
              direction={direction}
              // Narrowed to one route of a combined route like SL4/SL5 by the header's Route filter.
              routeFilter={routeId === ALL_ROUTES ? busRoute : routeId}
            />
          </ErrorBoundary>
        </div>
        {/* Only with a map to read it against, not under "No data available". */}
        <BusSpeedLegend hasDwells={typeof dwellsUrl === 'string'} />
      </>
    );
  };

  return (
    <>
      <ChartPageDiv>
        <WidgetDiv>
          <WidgetTitle
            title={
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {summary}
                <InProgressBadge date={date} period={period} />
              </span>
            }
            action={<CopyLinkButton />}
          />
          <div className="flex flex-col gap-3">{renderBody()}</div>
        </WidgetDiv>
        <BusSpeedDataNotes />
      </ChartPageDiv>
    </>
  );
}
