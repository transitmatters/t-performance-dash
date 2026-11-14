import { getBusRouteDisplayName } from '../../../common/constants/lines';
import { TERMINAL_SECTION_NOTES } from '../constants';
import type { BusSpeedSegmentProperties, Period } from '../types';
import {
  compareRouteNames,
  formatSegmentDelay,
  formatSegmentSpeed,
  isPooledSegment,
  noSpeedReason,
  periodSuffix,
  segmentDistanceAndTime,
  segmentDwell,
  segmentSpeed,
  segmentSpeedRange,
} from '../utils';

interface SegmentPopupContentProps {
  /**
   * Every feature on the hovered segment, all sharing its direction and stop pair: one per route,
   * more than one wherever routes run the same street, like SL4 and SL5 on Washington St. Led by
   * the pooled feature for the pair, where it's the one drawn (see shared_routes).
   */
  segments: BusSpeedSegmentProperties[];
  period: Period;
}

const SegmentStats = ({
  segment,
  label,
  trips,
  period,
}: {
  segment: BusSpeedSegmentProperties;
  label?: string;
  trips: string;
  period: Period;
}) => {
  const distanceAndTime = segmentDistanceAndTime(segment);
  // Only in archives from before dwell had a layer of its own, whose speeds count it.
  const dwell = segmentDwell(segment);
  const speedRange = segmentSpeedRange(segment);
  const delay = formatSegmentDelay(segment);
  return (
    <div className="mt-1">
      <p className="text-sm font-semibold">
        {label && `${label} · `}
        {formatSegmentSpeed(segment)}
      </p>
      {segmentSpeed(segment) == null && <p className="text-stone-600">{noSpeedReason(segment)}</p>}
      {delay && <p className="text-stone-600">{delay}</p>}
      {distanceAndTime && <p className="text-stone-600">{distanceAndTime}</p>}
      {dwell && (
        <p className="text-stone-600">
          Includes about {dwell} at {segment.from_stop_name}
        </p>
      )}
      <p className="text-stone-600">
        {segmentSpeed(segment) == null ? trips : `Median of ${trips}`}
        {periodSuffix(period)}
        {segment.n_interpolated > 0 && `, ${segment.n_interpolated} with an interpolated stop time`}
      </p>
      {speedRange && <p className="text-stone-600">8 in 10 trips ran {speedRange}</p>}
      {segment.terminal_section && (
        <p className="text-stone-600">{TERMINAL_SECTION_NOTES[segment.terminal_section]}</p>
      )}
    </div>
  );
};

export const SegmentPopupContent = ({ segments, period }: SegmentPopupContentProps) => {
  const [{ direction_id, from_stop_name, to_stop_name }] = segments;
  const pooled = segments.find(isPooledSegment);
  const routes = segments.filter((segment) => !isPooledSegment(segment));
  // Named from the pooled feature where there is one, so a route whose own line hasn't loaded
  // with it is still listed.
  const routeNames = (pooled ? pooled.route_id.split(',') : routes.map((route) => route.route_id))
    .map(getBusRouteDisplayName)
    .sort(compareRouteNames);
  return (
    <div className="text-xs text-stone-900">
      <p className="font-semibold">
        {routeNames.length > 1 ? 'Routes' : 'Route'} {routeNames.join(', ')}
        <span className="font-normal text-stone-600">
          {' '}
          · {direction_id === 1 ? 'Inbound' : 'Outbound'}
        </span>
      </p>
      <p className="text-stone-600">
        {from_stop_name} → {to_stop_name}
      </p>
      {pooled ? (
        <>
          <SegmentStats
            segment={pooled}
            label="Combined"
            trips={`${pooled.n_traversals} trips on ${routeNames.length === 2 ? 'both' : `all ${routeNames.length}`} routes`}
            period={period}
          />
          <ul className="mt-1 border-t border-stone-200 pt-1 text-stone-600">
            {routes.map((route) => (
              <li key={route.route_id}>
                {getBusRouteDisplayName(route.route_id)} · {formatSegmentSpeed(route)} ·{' '}
                {route.n_traversals} trips
              </li>
            ))}
          </ul>
        </>
      ) : (
        routes.map((route) => (
          <SegmentStats
            key={route.route_id}
            segment={route}
            label={routes.length > 1 ? getBusRouteDisplayName(route.route_id) : undefined}
            trips={`${route.n_traversals} trips`}
            period={period}
          />
        ))
      )}
    </div>
  );
};
