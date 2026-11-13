import { useMemo, useState } from 'react';
import classNames from 'classnames';
import { useBusStopRidershipData } from '../../common/api/hooks/ridership';
import { Widget } from '../../common/components/widgets';
import { ButtonGroup } from '../../common/components/general/ButtonGroup';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { getBusRouteDisplayName, LINE_OBJECTS } from '../../common/constants/lines';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import type { BusStopRidership as BusStopRidershipData } from '../../common/types/dataPoints';
import { BusStopRidershipMap } from './map/BusStopRidershipMap';
import {
  DIRECTION_LABELS,
  getBusStopRidershipRouteIds,
  getStopComparisons,
  resolveBusStopRidershipSelection,
} from './map/busStopUtils';

const formatChange = (change: number) =>
  `${change > 0 ? '+' : change < 0 ? '−' : ''}${Math.abs(Math.round(change * 100))}%`;

const StopComparisons = ({
  route,
  season,
  directionId,
  stopId,
}: {
  route: BusStopRidershipData;
  season: string;
  directionId: number;
  stopId: string;
}) => {
  const comparisons = getStopComparisons(route, season, directionId, stopId);
  if (comparisons.length === 0) return null;
  return (
    <span className="text-xs text-stone-500 dark:text-stone-400">
      {comparisons.map((comparison) => (
        <span key={comparison.season} className="block">
          {comparison.season}: {Math.round(comparison.boardings).toLocaleString('en-us')}
          {comparison.change !== undefined && (
            <span
              className={classNames(
                'ml-1 font-semibold',
                comparison.change > 0.05
                  ? 'text-green-700 dark:text-green-400'
                  : comparison.change < -0.05
                    ? 'text-red-700 dark:text-red-400'
                    : undefined
              )}
            >
              ({formatChange(comparison.change)} since)
            </span>
          )}
        </span>
      ))}
    </span>
  );
};

/**
 * Average weekday boardings at each stop of a bus route, one season at a time. The MBTA counts
 * these once a year, so unlike the rest of the page this doesn't follow the date range.
 */
export const BusStopRidership = ({ busRoute }: { busRoute: string }) => {
  const routeIds = useMemo(() => getBusStopRidershipRouteIds(busRoute), [busRoute]);
  const ridership = useBusStopRidershipData(routeIds, true);
  const isDesktop = useBreakpoint('lg');

  const [routeId, setRouteId] = useState<string>('');
  const [season, setSeason] = useState<string>('');
  const [directionKey, setDirectionKey] = useState<string>('');

  const view = ridership.data
    ? resolveBusStopRidershipSelection(ridership.data, {
        routeId,
        season,
        directionId: directionKey === '' ? undefined : Number(directionKey),
      })
    : null;

  const routeOptions = (view?.routesWithData ?? []).map(({ route_id }): [string, string] => [
    route_id,
    getBusRouteDisplayName(route_id),
  ]);
  const directionOptions = (view?.directionIds ?? []).map((id): [string, string] => [
    String(id),
    DIRECTION_LABELS[id] ?? `Direction ${id}`,
  ]);

  return (
    <Widget
      title="Stop ridership"
      subtitle={
        view
          ? `Average weekday boardings at each stop in ${view.season}, from the MBTA's yearly ridership counts. This doesn't follow the date range.`
          : "Average weekday boardings at each stop, from the MBTA's yearly ridership counts."
      }
      ready={[ridership]}
    >
      {view && view.stops.length > 0 ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {routeOptions.length > 1 && (
              <ButtonGroup
                options={routeOptions}
                pressFunction={setRouteId}
                selectedIndex={routeOptions.findIndex(([key]) => key === view.route.route_id)}
                line="line-bus"
                additionalDivClass="w-auto"
                additionalButtonClass="flex-none px-3"
              />
            )}
            {directionOptions.length > 1 && (
              <ButtonGroup
                options={directionOptions}
                pressFunction={setDirectionKey}
                selectedIndex={directionOptions.findIndex(
                  ([key]) => key === String(view.directionId)
                )}
                line="line-bus"
                additionalDivClass="w-auto"
                additionalButtonClass="flex-none px-3"
              />
            )}
            <label className="flex items-center gap-2 text-sm">
              <span className="text-stone-600 dark:text-stone-300">Season</span>
              <select
                className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-800"
                value={view.season}
                onChange={(event) => setSeason(event.target.value)}
              >
                {[...view.seasons].reverse().map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <BusStopRidershipMap
            // Remount when the stops change, so the diagram doesn't animate between routes
            key={`${view.route.route_id}-${view.season}-${view.directionId}-${isDesktop}`}
            stops={view.stops}
            stopNames={view.route.stop_names}
            color={LINE_OBJECTS['line-bus'].color}
            direction={isDesktop ? 'horizontal' : 'vertical'}
            period={view.season}
            getStopDetails={(stopId) => (
              <StopComparisons
                route={view.route}
                season={view.season}
                directionId={view.directionId}
                stopId={stopId}
              />
            )}
          />
        </div>
      ) : (
        <NoDataNotice isLineMetric />
      )}
    </Widget>
  );
};
