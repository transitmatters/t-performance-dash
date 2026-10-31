import { getBusRouteDisplayName } from '../../../common/constants/lines';
import type { BusSpeedSegmentProperties, Period } from '../types';
import { segmentDistanceAndTime } from '../utils';

interface SegmentPopupContentProps {
  /**
   * One feature per route drawn on the hovered segment, all sharing its direction and stop pair:
   * more than one wherever routes run the same street, like SL4 and SL5 on Washington St.
   */
  segments: BusSpeedSegmentProperties[];
  period: Period;
}

export const SegmentPopupContent = ({ segments, period }: SegmentPopupContentProps) => {
  const [{ direction_id, from_stop_name, to_stop_name }] = segments;
  const isShared = segments.length > 1;
  return (
    <div className="text-xs text-stone-900">
      <p className="font-semibold">
        {isShared ? 'Routes' : 'Route'}{' '}
        {segments.map((segment) => getBusRouteDisplayName(segment.route_id)).join(', ')}
        <span className="font-normal text-stone-600">
          {' '}
          · {direction_id === 1 ? 'Inbound' : 'Outbound'}
        </span>
      </p>
      <p className="text-stone-600">
        {from_stop_name} → {to_stop_name}
      </p>
      {segments.map((segment) => {
        const distanceAndTime = segmentDistanceAndTime(segment);
        return (
          <div key={segment.route_id} className="mt-1">
            <p className="text-sm font-semibold">
              {isShared && `${getBusRouteDisplayName(segment.route_id)} · `}
              {segment.p50_speed_mph.toFixed(1)} mph
            </p>
            {distanceAndTime && <p className="text-stone-600">{distanceAndTime}</p>}
            <p className="text-stone-600">
              Median of {segment.n_traversals} trips
              {period !== 'daily' && ` this ${period === 'weekly' ? 'week' : 'month'}`}
              {segment.n_interpolated > 0 &&
                `, ${segment.n_interpolated} with an interpolated stop time`}
            </p>
          </div>
        );
      })}
    </div>
  );
};
